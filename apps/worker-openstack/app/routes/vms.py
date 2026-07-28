from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services import vm_service
from app.deps import get_conn

router = APIRouter(prefix="/api/v1")

class CreateVMRequest(BaseModel):
    name: str
    image_id: str
    flavor_id: str
    network_id: str

@router.get("/vms")
def list_vms(conn=Depends(get_conn)):
    return vm_service.list_vms_service(conn)

@router.get("/vms/{vm_id}")
def get_vm_by_id(vm_id: str, conn=Depends(get_conn)):
    return vm_service.get_vm_by_id_service(conn, vm_id)

@router.post("/vms")
def create_vm(body: CreateVMRequest, conn=Depends(get_conn)):
    return vm_service.create_vm_service(conn, body.name, body.image_id, body.flavor_id, body.network_id)

@router.delete("/vms/{vm_id}")
def delete_vm(vm_id: str, conn=Depends(get_conn)):
    vm_service.delete_vm_service(conn, vm_id)
    return {"message": "VM supprimée"}

@router.post("/vms/{vm_id}/start")
def start_vm(vm_id: str, conn=Depends(get_conn)):
    vm_service.start_vm_service(conn, vm_id)
    return {"message": "VM démarrée"}

@router.post("/vms/{vm_id}/stop")
def stop_vm(vm_id: str, conn=Depends(get_conn)):
    vm_service.stop_vm_service(conn, vm_id)
    return {"message": "VM arrêtée"}

@router.post("/vms/{vm_id}/reboot")
def reboot_vm(vm_id: str, conn=Depends(get_conn)):
    vm_service.reboot_vm_service(conn, vm_id)
    return {"message": "VM redémarrée"}

@router.get("/vms/{vm_id}/volumes")
def get_volumes_by_vm(vm_id: str, conn=Depends(get_conn)):
    return vm_service.get_volumes_by_vm_service(conn, vm_id)
