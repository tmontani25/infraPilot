from fastapi import APIRouter
from app.services import playbook_registry

router = APIRouter(prefix="/api/v1")


@router.get("/playbooks")
def list_playbooks():
    return playbook_registry.list_playbooks()
