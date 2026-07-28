import json
from typing import Optional
from fastapi import Header, HTTPException
from app.connection import get_connection


def get_conn(x_provider_credentials: Optional[str] = Header(default=None)):
    credentials = None
    if x_provider_credentials:
        try:
            credentials = json.loads(x_provider_credentials)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="X-Provider-Credentials invalide")
    return get_connection(credentials)
