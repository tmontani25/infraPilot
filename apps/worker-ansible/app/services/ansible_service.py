import json
import shutil
import subprocess
import sys
import threading
from pathlib import Path
from fastapi import HTTPException

from app.services.playbook_registry import get_playbook_dir

WORKSPACES_DIR = Path(__file__).resolve().parent.parent.parent / "workspaces"
TIMEOUT_SECONDS = 300
FORKS = 10  # parallélise l'exécution des tâches sur jusqu'à 10 hôtes à la fois

# résolu via l'interpréteur Python courant plutôt que le PATH : évite de dépendre
# de l'activation du venv par le process qui lance uvicorn (dev-up.sh, Docker...)
_ANSIBLE_PLAYBOOK_BIN = str(Path(sys.executable).parent / "ansible-playbook")

_processes: dict[str, subprocess.Popen] = {}
_lock = threading.Lock()


def _workspace_dir(run_id: str) -> Path:
    return WORKSPACES_DIR / run_id


def _log_path(workspace: Path) -> Path:
    return workspace / "run.log"


def _status_path(workspace: Path) -> Path:
    return workspace / "status.json"


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


def _wait_and_finalize(run_id: str, workspace: Path, proc: subprocess.Popen) -> None:
    try:
        returncode = proc.wait(timeout=TIMEOUT_SECONDS)
        status = "success" if returncode == 0 else "failed"
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait()
        status = "failed"
        with open(_log_path(workspace), "a") as f:
            f.write(f"\nCommande expirée après {TIMEOUT_SECONDS}s, processus tué.\n")
    finally:
        with _lock:
            _processes.pop(run_id, None)
    _status_path(workspace).write_text(json.dumps({"status": status}))


def start_run(run_id: str, playbook_id: str, hosts: list[dict], ssh_user: str, ssh_key_path: str) -> dict:
    if not hosts:
        raise HTTPException(status_code=400, detail="Aucune machine cible")

    playbook_dir = get_playbook_dir(playbook_id)
    workspace = _workspace_dir(run_id)
    if workspace.exists():
        shutil.rmtree(workspace)
    shutil.copytree(playbook_dir, workspace)
    (workspace / "manifest.json").unlink(missing_ok=True)

    inventory_path = _write_inventory(workspace, hosts, ssh_user, ssh_key_path)
    log_file = open(_log_path(workspace), "w")

    try:
        proc = subprocess.Popen(
            [_ANSIBLE_PLAYBOOK_BIN, "-i", str(inventory_path), "--forks", str(FORKS), "playbook.yml"],
            cwd=workspace, stdout=log_file, stderr=subprocess.STDOUT, text=True,
        )
    except FileNotFoundError:
        log_file.write("ansible-playbook introuvable : installe ansible dans l'environnement du worker (pip install ansible)")
        _status_path(workspace).write_text(json.dumps({"status": "failed"}))
        return {"status": "failed"}
    finally:
        log_file.close()

    with _lock:
        _processes[run_id] = proc
    threading.Thread(target=_wait_and_finalize, args=(run_id, workspace, proc), daemon=True).start()

    return {"status": "running"}


def get_run_log(run_id: str) -> dict:
    workspace = _workspace_dir(run_id)
    log_path = _log_path(workspace)
    if not log_path.exists():
        raise HTTPException(status_code=404, detail="Exécution introuvable")

    output = log_path.read_text(errors="replace")
    status_path = _status_path(workspace)
    if status_path.exists():
        status = json.loads(status_path.read_text())["status"]
    else:
        status = "running"

    return {"status": status, "output": output}
