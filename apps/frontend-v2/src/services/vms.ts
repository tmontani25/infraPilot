import { api } from '../lib/apiClient'
import type { VM } from '../types'

export async function getVms(): Promise<VM[]> {
  const { data } = await api.get('/vms')
  return data
}

export async function startVm(id: string): Promise<void> {
  await api.post(`/vms/${id}/start`)
}

export async function stopVm(id: string): Promise<void> {
  await api.post(`/vms/${id}/stop`)
}

export async function rebootVm(id: string): Promise<void> {
  await api.post(`/vms/${id}/reboot`)
}

export async function createVm(name : string, image_id : string, flavor_id : string, network_id : string){
  await api.post(`/vms`, { name, image_id, flavor_id, network_id })
}
export async function deleteVm(id: string): Promise<void> {
  await api.delete(`/vms/${id}`)
}