from fastapi import APIRouter
from app.services import template_registry

router = APIRouter(prefix="/api/v1")


@router.get("/templates")
def list_templates():
    return template_registry.list_templates()
