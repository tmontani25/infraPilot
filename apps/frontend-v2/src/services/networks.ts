import { api } from '../lib/apiClient'
import type { Network, Subnet, SecurityGroup } from '../types'

export async function getNetworks(): Promise<Network[]> {
  const { data } = await api.get('/networks')
  return data
}

export async function getSubnets(): Promise<Subnet[]> {
  const { data } = await api.get('/subnets')
  return data
}

export async function getSecurityGroups(): Promise<SecurityGroup[]> {
  const { data } = await api.get('/security-groups')
  return data
}
