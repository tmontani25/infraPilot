export interface VM {
  id: string
  name: string
  status: string
  flavor: { vcpus: number; ram: number; disk: number }
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

export interface ConnectedVM {
  name: string
  ip: string | null
}

export interface Network {
  id: string
  name: string
  is_external: boolean
  subnets: NetworkSubnet[]
  connected_vms: ConnectedVM[]
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

export interface Client {
  id: number
  name: string
}

export interface Project {
  id: number
  clientId: number | null
  name: string
}

export interface CloudProvider {
  id: number
  projectId: number
  type: 'openstack' | 'proxmox' | 'hetzner'
  name: string
}

export interface DeploymentTemplateVariable {
  name: string
  label: string
  type: string
}

export interface DeploymentTemplate {
  id: string
  name: string
  description: string
  variables: DeploymentTemplateVariable[]
}

export type DeploymentStatus = 'pending' | 'planned' | 'applied' | 'destroyed' | 'failed'

export interface Deployment {
  id: number
  providerId: number
  templateId: string
  name: string
  variables: Record<string, string>
  status: DeploymentStatus
  planOutput: string | null
  applyOutput: string | null
  destroyOutput: string | null
  createdAt: string
  updatedAt: string
}

export interface OpenstackCredentials {
  auth_url: string
  project_id: string
  project_name: string
  username: string
  password: string
  user_domain_name: string
  project_domain_id: string
  region_name: string
  interface: string
  identity_api_version: string
}
