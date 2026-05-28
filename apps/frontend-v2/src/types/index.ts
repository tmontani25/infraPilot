export interface VM {
  id: string
  name: string
  status: string
}

export interface VolumeAttachment {
  server_id: string | null
  device: string | null
}

export interface Volume {
  id: string
  name: string
  size: number
  status: string
  attachments: VolumeAttachment[]
}

export interface NetworkSubnet {
  id: string
  name: string
  cidr: string
}

export interface Network {
  id: string
  name: string
  is_external: boolean
  subnets: NetworkSubnet[]
  connected_vms: string[]
  has_router: boolean
}

export interface Subnet {
  id: string
  name: string
  cidr: string
  network_id: string
}

export interface SecurityGroup {
  id: string
  name: string
  description: string
  connected_vms: string[]
  rules: {
    protocol: string | null
    port_min: number | null
    port_max: number | null
    direction: string
    remote_ip: string | null
  }[]
}

export interface VMDetail {
  id: string
  name: string
  status: string
  flavor: string
  image: string | null
  addresses: Record<string, { addr: string; version: number; 'OS-EXT-IPS:type': string }[]>
  created_at: string
  key_name: string | null
}

export interface Image {
  id: string
  name: string
  status: string
  disk_format: string
  size: number
}

export interface Flavor {
  id: string
  name: string
  vcpus: number
  ram: number
  disk: number
}

export interface Keypair {
  name: string
  fingerprint: string
}
