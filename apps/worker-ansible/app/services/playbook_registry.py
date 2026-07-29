import json
from pathlib import Path
from fastapi import HTTPException

PLAYBOOKS_DIR = Path(__file__).resolve().parent.parent.parent / "playbooks"


def list_playbooks() -> list[dict]:
    playbooks = []
    for entry in sorted(PLAYBOOKS_DIR.iterdir()):
        manifest = entry / "manifest.json"
        if manifest.exists():
            playbooks.append(json.loads(manifest.read_text()))
    return playbooks


def get_playbook_dir(playbook_id: str) -> Path:
    playbook_dir = PLAYBOOKS_DIR / playbook_id
    if not (playbook_dir / "manifest.json").exists():
        raise HTTPException(status_code=404, detail=f"Playbook introuvable: {playbook_id}")
    return playbook_dir
