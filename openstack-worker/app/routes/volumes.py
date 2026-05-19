from fastapi import APIRouter
from app.services import volume_service

router = APIRouter(prefix="/api/v1")

@router.get("/volumes")
def list_volumes():
    return volume_service.get_all_volumes_service()

@router.get("/volumes/{volume_id}")
def get_volume(volume_id: str):
    return volume_service.get_volume_by_id_service(volume_id)

@router.delete("/volumes/{volume_id}")
def delete_volume(volume_id: str):
    volume_service.delete_volume_by_id_service(volume_id)
    return {"message": "volume supprimé"}
