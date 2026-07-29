from fastapi import APIRouter
from pydantic import BaseModel
from app.services import ansible_service
from app.config import SSH_KEY_PATH

router = APIRouter(prefix="/api/v1")


class Host(BaseModel):
    name: str
    ip: str


class RunRequest(BaseModel):
    run_id: str
    playbook_id: str
    hosts: list[Host]
    ssh_user: str = "ubuntu"


@router.post("/runs")
def create_run(body: RunRequest):
    hosts = [h.model_dump() for h in body.hosts]
    return ansible_service.run_playbook(body.run_id, body.playbook_id, hosts, body.ssh_user, SSH_KEY_PATH)
