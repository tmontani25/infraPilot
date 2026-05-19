from fastapi import APIRouter
from app.services import resource_service

router = APIRouter(prefix="/api/v1")

@router.get("/images")
def list_images():
    return resource_service.list_images_service()

@router.get("/flavors")
def list_flavors():
    return resource_service.list_flavors_service()

@router.get("/networks")
def list_networks():
    return resource_service.list_networks_service()

@router.get("/subnets")
def list_subnets():
    return resource_service.list_subnets_service()

@router.get("/security-groups")
def list_security_groups():
    return resource_service.list_security_groups_service()

@router.get("/keypairs")
def list_keypairs():
    return resource_service.get_ssh_keys_service()
