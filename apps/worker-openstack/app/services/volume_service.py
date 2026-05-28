from app.connection import conn
from app.cache import ttl_cache

@ttl_cache(ttl=30)
def get_all_volumes_service():
    volumes = conn.block_storage.volumes()
    return [
        {
            "id": vol.id,
            "name": vol.name,
            "size": vol.size,
            "status": vol.status,
            "attachments": [{"server_id": a.get("server_id"), "device": a.get("device")} for a in (vol.attachments or [])],
        }
        for vol in volumes
    ]

def get_volume_by_id_service(volume_id: str):
    vol = conn.block_storage.get_volume(volume_id)
    return {
        "id": vol.id,
        "name": vol.name,
        "size": vol.size,
        "status": vol.status,
        "attachments": [{"server_id": a.get("server_id"), "device": a.get("device")} for a in (vol.attachments or [])],
    }

def delete_volume_by_id_service(volume_id: str):
    conn.block_storage.delete_volume(volume_id)
