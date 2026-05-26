import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export type OsNetwork = {
  id: string
  name: string
  status: string
  admin_state_up: boolean
  shared: boolean
  subnets?: string[]
}

export type OsSubnet = {
  id: string
  name: string
  network_id: string
  cidr: string
  ip_version: number
  gateway_ip: string | null
}

export const networkKeys = {
  all: ['networks'] as const,
  subnets: ['subnets'] as const,
}

export const useNetworks = () =>
  useQuery({
    queryKey: networkKeys.all,
    queryFn: () => apiClient.get<OsNetwork[]>('/networks').then((r) => r.data),
  })

export const useSubnets = () =>
  useQuery({
    queryKey: networkKeys.subnets,
    queryFn: () => apiClient.get<OsSubnet[]>('/subnets').then((r) => r.data),
  })
