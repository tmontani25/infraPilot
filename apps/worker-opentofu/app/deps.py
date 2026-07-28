import json
from typing import Optional
from fastapi import Header, HTTPException


def get_credentials(x_provider_credentials: Optional[str] = Header(default=None)) -> dict:
    if not x_provider_credentials:
        raise HTTPException(status_code=400, detail="X-Provider-Credentials manquant")
    try:
        return json.loads(x_provider_credentials)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="X-Provider-Credentials invalide")
