from fastapi import APIRouter
from app.services import quota_service

router = APIRouter(prefix="/api/v1")

@router.get("/quotas")
def get_quotas():
    return quota_service.get_quotas_service()
