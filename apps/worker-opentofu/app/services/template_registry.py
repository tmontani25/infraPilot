import json
from pathlib import Path
from fastapi import HTTPException

TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent / "templates"


def list_templates() -> list[dict]:
    templates = []
    for entry in sorted(TEMPLATES_DIR.iterdir()):
        manifest = entry / "template.json"
        if manifest.exists():
            templates.append(json.loads(manifest.read_text()))
    return templates


def get_template_dir(template_id: str) -> Path:
    template_dir = TEMPLATES_DIR / template_id
    if not (template_dir / "template.json").exists():
        raise HTTPException(status_code=404, detail=f"Template introuvable: {template_id}")
    return template_dir
