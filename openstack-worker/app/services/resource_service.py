from app.connection import conn

def list_images_service():
    return [{"id": img.id, "name": img.name} for img in conn.image.images()]

def list_flavors_service():
    return [{"id": f.id, "name": f.name, "ram": f.ram, "vcpus": f.vcpus, "disk": f.disk} for f in conn.compute.flavors()]

def list_networks_service():
    return [{"id": net.id, "name": net.name} for net in conn.network.networks()]

def list_subnets_service():
    return [{"id": s.id, "name": s.name, "cidr": s.cidr, "network_id": s.network_id} for s in conn.network.subnets()]

def list_security_groups_service():
    return [
        {
            "id": sg.id,
            "name": sg.name,
            "description": sg.description,
            "rules": [
                {
                    "protocol": r.protocol,
                    "port_min": r.port_range_min,
                    "port_max": r.port_range_max,
                    "direction": r.direction,
                    "remote_ip": r.remote_ip_prefix
                } for r in sg.security_group_rules
            ]
        } for sg in conn.network.security_groups()
    ]

def get_ssh_keys_service():
    return [{"id": kp.id, "name": kp.name, "public_key": kp.public_key} for kp in conn.compute.keypairs()]