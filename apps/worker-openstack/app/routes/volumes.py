from fastapi import APIRouter, Depends
from app.services import volume_service
from app.deps import get_conn

router = APIRouter(prefix="/api/v1")

@router.get("/volumes")
def list_volumes(conn=Depends(get_conn)):
    return volume_service.get_all_volumes_service(conn)

@router.get("/volumes/{volume_id}")
def get_volume(volume_id: str, conn=Depends(get_conn)):
    return volume_service.get_volume_by_id_service(conn, volume_id)

@router.delete("/volumes/{volume_id}")
def delete_volume(volume_id: str, conn=Depends(get_conn)):
    volume_service.delete_volume_by_id_service(conn, volume_id)
    return {"message": "volume supprimé"}
