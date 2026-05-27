import { api } from '../lib/apiClient'
import type { Volume } from '../types'

export async function getVolumes(): Promise<Volume[]> {
  const { data } = await api.get('/volumes')
  return data
}

export async function getVolumeById(id: string): Promise<Volume> {
  const { data } = await api.get(`/volumes/${id}`)
  return data
}

export async function deleteVolume(id: string): Promise<void> {
  await api.delete(`/volumes/${id}`)
}
