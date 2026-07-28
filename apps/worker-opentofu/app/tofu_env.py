"""Traduit les credentials d'un CloudProvider (même forme que côté worker-openstack)
en variables d'environnement OS_* que le provider openstack de OpenTofu lit nativement."""
import os

_KEY_MAP = {
    "auth_url": "OS_AUTH_URL",
    "project_id": "OS_PROJECT_ID",
    "project_name": "OS_PROJECT_NAME",
    "username": "OS_USERNAME",
    "password": "OS_PASSWORD",
    "user_domain_name": "OS_USER_DOMAIN_NAME",
    "project_domain_id": "OS_PROJECT_DOMAIN_ID",
    "region_name": "OS_REGION_NAME",
    "interface": "OS_INTERFACE",
    "identity_api_version": "OS_IDENTITY_API_VERSION",
}


def build_env(credentials: dict) -> dict:
    env = os.environ.copy()
    for key, os_key in _KEY_MAP.items():
        value = credentials.get(key)
        if value:
            env[os_key] = str(value)
    return env
