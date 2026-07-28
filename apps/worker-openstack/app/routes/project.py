import os
from fastapi import APIRouter, Depends
from app.deps import get_conn

router = APIRouter(prefix="/api/v1")


@router.get("/project")
def get_project(conn=Depends(get_conn)):
    name = None
    try:
        name = conn.current_project.name
    except Exception:
        name = os.getenv("OS_PROJECT_NAME") or os.getenv("OS_TENANT_NAME")
    return {"project_name": name}
