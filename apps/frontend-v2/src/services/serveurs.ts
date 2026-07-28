import { api } from '../lib/apiClient'
import type { Serveur, ServeurLiveSpec, ServeurEvent, ServeurEventType } from '../types'

export type ServeurInput = {
  clientId?: number | null
  name: string
  hebergement: string
  os: string
  distribution?: string | null
  deploymentType?: string | null
  cloudProviderId?: number | null
  cloudVmId?: string | null
  cpu?: number | null
  ram?: number | null
  disk?: number | null
  ip?: string | null
  ssh?: string | null
  rdp?: string | null
  vpn?: string | null
  sauvegardes?: string
}

export async function getServeurs(clientId?: number): Promise<Serveur[]> {
  const { data } = await api.get('/serveurs', { params: clientId != null ? { clientId } : {} })
  return data.data.serveurs
}

export async function getServeur(id: number): Promise<Serveur> {
  const { data } = await api.get(`/serveurs/${id}`)
  return data.data.serveur
}

export async function getServeurLiveSpec(id: number): Promise<ServeurLiveSpec | null> {
  const { data } = await api.get(`/serveurs/${id}/live`)
  return data.data.live
}

export async function getServeurEvents(id: number): Promise<ServeurEvent[]> {
  const { data } = await api.get(`/serveurs/${id}/events`)
  return data.data.events
}

export async function addServeurEvent(id: number, type: ServeurEventType, message: string): Promise<ServeurEvent> {
  const { data } = await api.post(`/serveurs/${id}/events`, { type, message })
  return data.data.event
}

export async function performServeurAction(id: number, action: string): Promise<Serveur> {
  const { data } = await api.post(`/serveurs/${id}/actions/${action}`)
  return data.data.serveur
}

export async function createServeur(input: ServeurInput): Promise<Serveur> {
  const { data } = await api.post('/serveurs', input)
  return data.data.serveur
}

export async function updateServeur(id: number, input: Partial<ServeurInput>): Promise<Serveur> {
  const { data } = await api.patch(`/serveurs/${id}`, input)
  return data.data.serveur
}

export async function deleteServeur(id: number): Promise<void> {
  await api.delete(`/serveurs/${id}`)
}
