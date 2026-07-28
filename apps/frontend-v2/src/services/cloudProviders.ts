import { api } from '../lib/apiClient'
import type { CloudProvider } from '../types'

export async function getCloudProviders(clientId: number): Promise<CloudProvider[]> {
  const { data } = await api.get(`/clients/${clientId}/cloud-providers`)
  return data.data.providers
}

export async function createCloudProvider(
  clientId: number,
  payload: { type: string; name: string; credentials: Record<string, unknown> }
): Promise<CloudProvider> {
  const { data } = await api.post(`/clients/${clientId}/cloud-providers`, payload)
  return data.data.provider
}

export async function deleteCloudProvider(id: number): Promise<void> {
  await api.delete(`/cloud-providers/${id}`)
}
