
export const config = {
  workers: {
    openstack: process.env.WORKER_OPENSTACK_URL ?? 'http://localhost:8000/api/v1',
    proxmox:   process.env.WORKER_PROXMOX_URL   ?? 'http://localhost:8001/api/v1',
    hetzner:   process.env.WORKER_HETZNER_URL   ?? 'http://localhost:8002/api/v1',
  },
  opentofuWorkerUrl: process.env.WORKER_OPENTOFU_URL ?? 'http://localhost:8010/api/v1',
  ansibleWorkerUrl: process.env.WORKER_ANSIBLE_URL ?? 'http://localhost:8020/api/v1',
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET ?? '',
  mode: process.env.MODE ?? 'dev'
}

export const isDev = process.env.MODE === 'dev'
export const isProd = process.env.MODE === 'production'