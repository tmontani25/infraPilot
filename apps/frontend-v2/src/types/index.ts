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
