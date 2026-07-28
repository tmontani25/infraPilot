"""Connexions OpenStack : une connexion par compte cloud (credentials), mise en cache
pour éviter de ré-authentifier à chaque requête. Sans credentials transmises, on
retombe sur la connexion .env locale (pratique en dev/tests directs du worker)."""
import hashlib
import json
from typing import Optional
from dotenv import load_dotenv
import openstack

load_dotenv()

_connections: dict = {}


def _credentials_key(credentials: dict) -> str:
    return hashlib.sha256(json.dumps(credentials, sort_keys=True).encode()).hexdigest()


def get_connection(credentials: Optional[dict] = None):
    key = _credentials_key(credentials) if credentials else "default"
    if key not in _connections:
        _connections[key] = openstack.connect(**credentials) if credentials else openstack.connect()
    return _connections[key]
