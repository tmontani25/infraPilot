from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services import tofu_service
from app.deps import get_credentials

router = APIRouter(prefix="/api/v1")


class CreateDeploymentRequest(BaseModel):
    deployment_id: str
    template_id: str
    variables: dict


class DestroyDeploymentRequest(BaseModel):
    variables: dict


@router.post("/deployments")
def create_deployment(body: CreateDeploymentRequest, credentials: dict = Depends(get_credentials)):
    return tofu_service.create_and_plan(body.deployment_id, body.template_id, body.variables, credentials)


@router.post("/deployments/{deployment_id}/apply")
def apply_deployment(deployment_id: str, credentials: dict = Depends(get_credentials)):
    return tofu_service.apply(deployment_id, credentials)


@router.post("/deployments/{deployment_id}/destroy")
def destroy_deployment(
    deployment_id: str, body: DestroyDeploymentRequest, credentials: dict = Depends(get_credentials)
):
    return tofu_service.destroy(deployment_id, body.variables, credentials)
