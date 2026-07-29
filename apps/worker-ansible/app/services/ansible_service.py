import shutil
import subprocess
from pathlib import Path
from fastapi import HTTPException

from app.services.playbook_registry import get_playbook_dir

WORKSPACES_DIR = Path(__file__).resolve().parent.parent.parent / "workspaces"
TIMEOUT_SECONDS = 300


def _workspace_dir(run_id: str) -> Path:
    return WORKSPACES_DIR / run_id


def _write_inventory(workspace: Path, hosts: list[dict], ssh_user: str, ssh_key_path: str) -> Path:
    lines = ["[targets]"]
    for h in hosts:
        lines.append(
            f"{h['name']} ansible_host={h['ip']} ansible_user={ssh_user} "
            f"ansible_ssh_private_key_file={ssh_key_path} "
            "ansible_ssh_common_args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'"
        )
    inventory_path = workspace / "inventory.ini"
    inventory_path.write_text("\n".join(lines) + "\n")
    return inventory_path


def run_playbook(run_id: str, playbook_id: str, hosts: list[dict], ssh_user: str, ssh_key_path: str) -> dict:
    if not hosts:
        raise HTTPException(status_code=400, detail="Aucune machine cible")

    playbook_dir = get_playbook_dir(playbook_id)
    workspace = _workspace_dir(run_id)
    if workspace.exists():
        shutil.rmtree(workspace)
    shutil.copytree(playbook_dir, workspace)
    (workspace / "manifest.json").unlink(missing_ok=True)

    inventory_path = _write_inventory(workspace, hosts, ssh_user, ssh_key_path)

    try:
        result = subprocess.run(
            ["ansible-playbook", "-i", str(inventory_path), "playbook.yml"],
            cwd=workspace, capture_output=True, text=True, timeout=TIMEOUT_SECONDS,
        )
        output = result.stdout + result.stderr
        status = "success" if result.returncode == 0 else "failed"
        return {"status": status, "output": output}
    except subprocess.TimeoutExpired:
        return {"status": "failed", "output": f"Commande expirée après {TIMEOUT_SECONDS}s"}
    except FileNotFoundError:
        return {
            "status": "failed",
            "output": "ansible-playbook introuvable : installe ansible dans l'environnement du worker (pip install ansible)",
        }
