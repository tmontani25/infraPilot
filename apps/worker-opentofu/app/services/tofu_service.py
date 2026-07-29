import json
import shutil
import subprocess
from pathlib import Path
from fastapi import HTTPException

from app.tofu_env import build_env
from app.services.template_registry import get_template_dir

WORKSPACES_DIR = Path(__file__).resolve().parent.parent.parent / "workspaces"
TIMEOUT_SECONDS = 300


def _workspace_dir(deployment_id: str) -> Path:
    return WORKSPACES_DIR / deployment_id


def _run(args: list[str], cwd: Path, env: dict) -> tuple[bool, str]:
    try:
        result = subprocess.run(
            args, cwd=cwd, env=env, capture_output=True, text=True, timeout=TIMEOUT_SECONDS
        )
        output = result.stdout + result.stderr
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        return False, f"Commande expirée après {TIMEOUT_SECONDS}s : {' '.join(args)}"


def _tfvars_args(variables: dict) -> list[str]:
    args = []
    for key, value in variables.items():
        serialized = json.dumps(value) if isinstance(value, (dict, list)) else value
        args += ["-var", f"{key}={serialized}"]
    return args


def create_and_plan(deployment_id: str, template_id: str, variables: dict, credentials: dict) -> dict:
    template_dir = get_template_dir(template_id)
    workspace = _workspace_dir(deployment_id)

    if workspace.exists():
        raise HTTPException(status_code=409, detail=f"Un workspace existe déjà pour {deployment_id}")
    shutil.copytree(template_dir, workspace)
    (workspace / "template.json").unlink(missing_ok=True)

    env = build_env(credentials)

    ok, init_output = _run(["tofu", "init", "-input=false"], cwd=workspace, env=env)
    if not ok:
        return {"status": "failed", "output": init_output}

    plan_args = ["tofu", "plan", "-input=false", "-out=tfplan"] + _tfvars_args(variables)
    ok, plan_output = _run(plan_args, cwd=workspace, env=env)
    if not ok:
        return {"status": "failed", "output": plan_output}

    return {"status": "planned", "output": plan_output}


def apply(deployment_id: str, credentials: dict) -> dict:
    workspace = _workspace_dir(deployment_id)
    if not workspace.exists():
        raise HTTPException(status_code=404, detail="Workspace introuvable, relancez un plan d'abord")

    env = build_env(credentials)
    ok, apply_output = _run(["tofu", "apply", "-input=false", "-auto-approve", "tfplan"], cwd=workspace, env=env)
    if not ok:
        return {"status": "failed", "output": apply_output}

    _, outputs_raw = _run(["tofu", "output", "-json"], cwd=workspace, env=env)
    try:
        outputs = json.loads(outputs_raw)
    except json.JSONDecodeError:
        outputs = {}

    return {"status": "applied", "output": apply_output, "outputs": outputs}


def destroy(deployment_id: str, variables: dict, credentials: dict) -> dict:
    workspace = _workspace_dir(deployment_id)
    if not workspace.exists():
        raise HTTPException(status_code=404, detail="Workspace introuvable")

    env = build_env(credentials)
    destroy_args = ["tofu", "destroy", "-input=false", "-auto-approve"] + _tfvars_args(variables)
    ok, destroy_output = _run(destroy_args, cwd=workspace, env=env)
    if not ok:
        return {"status": "failed", "output": destroy_output}

    return {"status": "destroyed", "output": destroy_output}
