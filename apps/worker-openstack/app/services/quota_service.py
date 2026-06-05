from concurrent.futures import ThreadPoolExecutor
from app.connection import conn


def get_quotas_service():
    project_id = conn.current_project_id
    result = {}

    # Récupère les limites + compte les vraies ressources en parallèle
    with ThreadPoolExecutor(max_workers=5) as ex:
        f_compute  = ex.submit(lambda: conn.compute.get_quota_set(project_id))
        f_storage  = ex.submit(lambda: conn.block_storage.get_quota_set(project_id))
        f_servers  = ex.submit(lambda: list(conn.compute.servers()))
        f_volumes  = ex.submit(lambda: list(conn.block_storage.volumes()))
        f_fips     = ex.submit(lambda: list(conn.network.ips()))

    def limit(q, key):
        v = getattr(q, key, 0)
        return int(v) if v and v != -1 else 0

    # Compute — usage calculé depuis les vraies VMs
    try:
        q       = f_compute.result()
        servers = f_servers.result()
        flavors = {f.id: f for f in conn.compute.flavors()}

        vcpus_used = 0
        ram_used   = 0
        for s in servers:
            fid = s.flavor.get("id") if isinstance(s.flavor, dict) else None
            if fid and fid in flavors:
                vcpus_used += flavors[fid].vcpus
                ram_used   += flavors[fid].ram

        result["instances"] = {"used": len(servers),  "limit": limit(q, "instances")}
        result["vcpus"]     = {"used": vcpus_used,    "limit": limit(q, "cores")}
        result["ram_mb"]    = {"used": ram_used,       "limit": limit(q, "ram")}
    except Exception:
        pass

    # Block storage — usage calculé depuis les vrais volumes
    try:
        q       = f_storage.result()
        volumes = f_volumes.result()

        gb_used = sum(v.size for v in volumes if v.size)

        result["volumes"]   = {"used": len(volumes), "limit": limit(q, "volumes")}
        result["gigabytes"] = {"used": gb_used,      "limit": limit(q, "gigabytes")}
    except Exception:
        pass

    # Network — floating IPs utilisées
    try:
        fips = f_fips.result()
        fips_used = len(fips)

        try:
            nq = conn.network.get_quota(project_id, details=True)
            fip_limit = (getattr(nq, "floatingip", None) or {}).get("limit", 0)
            sg_limit  = (getattr(nq, "security_group", None) or {}).get("limit", 0)
            sg_used   = (getattr(nq, "security_group", None) or {}).get("used", 0)
        except Exception:
            fip_limit, sg_limit, sg_used = 0, 0, 0

        result["floating_ips"]    = {"used": fips_used, "limit": fip_limit}
        result["security_groups"] = {"used": sg_used,   "limit": sg_limit}
    except Exception:
        pass

    return result
