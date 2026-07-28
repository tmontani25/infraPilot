from fastapi import APIRouter, Depends
from app.services import resource_service
from app.deps import get_conn

router = APIRouter(prefix="/api/v1")

@router.get("/images")
def list_images(conn=Depends(get_conn)):
    return resource_service.list_images_service(conn)

@router.get("/flavors")
def list_flavors(conn=Depends(get_conn)):
    return resource_service.list_flavors_service(conn)

@router.get("/networks")
def list_networks(conn=Depends(get_conn)):
    return resource_service.list_networks_service(conn)

@router.get("/subnets")
def list_subnets(conn=Depends(get_conn)):
    return resource_service.list_subnets_service(conn)

@router.get("/security-groups")
def list_security_groups(conn=Depends(get_conn)):
    return resource_service.list_security_groups_service(conn)

@router.get("/keypairs")
def list_keypairs(conn=Depends(get_conn)):
    return resource_service.get_ssh_keys_service(conn)
