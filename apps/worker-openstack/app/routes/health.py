from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1")


@router.get("/health")
def health():
    return{"status" : "ok"}