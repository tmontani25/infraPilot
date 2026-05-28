export interface VM {
  id: string
  name: string
  status: string
}

export interface Volume {
  id: string
  name: string
  size: number
  status: string
}

export interface Network {
  id: string
  name: string
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
