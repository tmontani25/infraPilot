from concurrent.futures import ThreadPoolExecutor
from app.cache import ttl_cache

def list_images_service(conn):
    return [{"id": img.id, "name": img.name} for img in conn.image.images()]

def list_flavors_service(conn):
    return [{"id": f.id, "name": f.name, "ram": f.ram, "vcpus": f.vcpus, "disk": f.disk} for f in conn.compute.flavors()]

@ttl_cache(ttl=30)
def list_networks_service(conn):
    with ThreadPoolExecutor(max_workers=4) as ex:
        f_networks = ex.submit(lambda: list(conn.network.networks()))
        f_subnets  = ex.submit(lambda: list(conn.network.subnets()))
        f_ports    = ex.submit(lambda: list(conn.network.ports()))
        f_vms      = ex.submit(lambda: {vm.id: vm.name for vm in conn.compute.servers()})

    networks = f_networks.result()
    subnets  = f_subnets.result()
    ports    = f_ports.result()
    vm_map   = f_vms.result()

    subnet_map = {}
    for s in subnets:
        subnet_map.setdefault(s.network_id, []).append({"id": s.id, "name": s.name, "cidr": s.cidr})

    vms_by_net = {}
    has_router = set()
    for p in ports:
        owner = p.device_owner or ''
        if owner.startswith('compute:') and p.device_id in vm_map:
            ip = p.fixed_ips[0]['ip_address'] if p.fixed_ips else None
            vms_by_net.setdefault(p.network_id, []).append({
                "name": vm_map[p.device_id],
                "ip": ip,
            })
        elif owner.startswith('network:router_interface'):
            has_router.add(p.network_id)

    return [
        {
            "id": net.id,
            "name": net.name,
            "is_external": bool(net.is_router_external),
            "subnets": subnet_map.get(net.id, []),
            "connected_vms": vms_by_net.get(net.id, []),
            "has_router": net.id in has_router,
        }
        for net in networks
    ]

def list_subnets_service(conn):
    return [{"id": s.id, "name": s.name, "cidr": s.cidr, "network_id": s.network_id} for s in conn.network.subnets()]

@ttl_cache(ttl=30)
def list_security_groups_service(conn):
    with ThreadPoolExecutor(max_workers=3) as ex:
        f_sgs   = ex.submit(lambda: list(conn.network.security_groups()))
        f_ports = ex.submit(lambda: list(conn.network.ports()))
        f_vms   = ex.submit(lambda: {vm.id: vm.name for vm in conn.compute.servers()})

    sgs    = f_sgs.result()
    ports  = f_ports.result()
    vm_map = f_vms.result()

    vms_by_sg = {}
    for p in ports:
        if not p.device_id or p.device_id not in vm_map:
            continue
        for sg_id in (p.security_group_ids or []):
            vms_by_sg.setdefault(sg_id, set()).add(vm_map[p.device_id])

    return [
        {
            "id": sg.id,
            "name": sg.name,
            "description": sg.description,
            "connected_vms": list(vms_by_sg.get(sg.id, set())),
            "rules": [
                {
                    "protocol": r.get("protocol"),
                    "port_min": r.get("port_range_min"),
                    "port_max": r.get("port_range_max"),
                    "direction": r.get("direction"),
                    "remote_ip": r.get("remote_ip_prefix")
                } for r in sg.security_group_rules
            ]
        } for sg in sgs
    ]

def get_ssh_keys_service(conn):
    return [{"id": kp.id, "name": kp.name, "public_key": kp.public_key} for kp in conn.compute.keypairs()]

# Liste les hyperviseurs (API admin Nova) : disponibilité et charge de l'infra physique.
# Sur un cloud public (ex: Infomaniak), les credentials d'un projet client n'ont
# généralement pas les droits admin nécessaires — l'appel peut légitimement échouer
# en 403, géré comme les autres erreurs HTTP par error_handler.py.
def list_hypervisors_service(conn):
    return [
        {
            "id": h.id,
            "name": getattr(h, "hypervisor_hostname", None) or getattr(h, "name", h.id),
            "state": h.state,
            "status": h.status,
            "vcpus": h.vcpus,
            "vcpus_used": h.vcpus_used,
            "memory_mb": h.memory_size,
            "memory_used_mb": h.memory_used,
            "running_vms": h.running_vms,
        }
        for h in conn.compute.hypervisors(details=True)
    ]
