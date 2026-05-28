import os
from fastapi import APIRouter
from app.connection import conn

router = APIRouter(prefix="/api/v1")


@router.get("/project")
def get_project():
    name = None
    try:
        name = conn.current_project.name
    except Exception:
        name = os.getenv("OS_PROJECT_NAME") or os.getenv("OS_TENANT_NAME")
    return {"project_name": name}
