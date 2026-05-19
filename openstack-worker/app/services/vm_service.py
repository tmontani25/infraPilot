from app.connection import conn

def list_vms_service():
    servers = conn.compute.servers()
    return [{"id": vm.id, "name": vm.name, "status": vm.status} for vm in servers]

def get_vm_by_id_service(vm_id: str):
    vm = conn.compute.get_server(vm_id)
    return {
        "id": vm.id,
        "name": vm.name,
        "status": vm.status,
        "flavor": vm.flavor["id"],
        "image": vm.image["id"] if vm.image else None,
        "addresses": vm.addresses,
        "created_at": vm.created_at,
        "key_name": vm.key_name,
    }

def create_vm_service(name: str, image_id: str, flavor_id: str, network_id: str):
    vm = conn.compute.create_server(
        name=name,
        image_id=image_id,
        flavor_id=flavor_id,
        networks=[{"uuid": network_id}]
    )
    return {"id": vm.id, "name": vm.name, "status": vm.status}

def delete_vm_service(vm_id: str):
    conn.compute.delete_server(vm_id)

def start_vm_service(vm_id: str):
    conn.compute.start_server(vm_id)

def stop_vm_service(vm_id: str):
    conn.compute.stop_server(vm_id)

def reboot_vm_service(vm_id: str):
    conn.compute.reboot_server(vm_id)

def get_volumes_by_vm_service(vm_id: str):
    vm = conn.compute.get_server(vm_id)
    volumes = [conn.block_storage.get_volume(v["id"]) for v in vm.attached_volumes]
    return [{"id": vol.id, "name": vol.name, "size": vol.size, "status": vol.status} for vol in volumes]
