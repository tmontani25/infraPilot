from fastapi import APIRouter, Depends
from app.services import quota_service
from app.deps import get_conn

router = APIRouter(prefix="/api/v1")

@router.get("/quotas")
def get_quotas(conn=Depends(get_conn)):
    return quota_service.get_quotas_service(conn)
