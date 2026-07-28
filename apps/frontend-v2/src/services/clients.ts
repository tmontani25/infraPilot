import { api } from '../lib/apiClient'
import type { Client } from '../types'

export async function getClients(): Promise<Client[]> {
  const { data } = await api.get('/clients')
  return data.data.clients
}

export async function createClient(name: string): Promise<Client> {
  const { data } = await api.post('/clients', { name })
  return data.data.client
}

export type ClientUpdateInput = Partial<{
  name: string
  address: string | null
  contacts: string | null
  contrats: string | null
}>

export async function updateClient(id: number, input: ClientUpdateInput): Promise<Client> {
  const { data } = await api.patch(`/clients/${id}`, input)
  return data.data.client
}

export async function deleteClient(id: number): Promise<void> {
  await api.delete(`/clients/${id}`)
}
