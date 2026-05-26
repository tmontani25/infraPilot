import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export type Vm = {
  id: string
  name: string
  status: string
  addresses?: Record<string, { addr: string; version: number }[]>
  flavor?: { id: string }
  created?: string
}

export type CreateVmBody = {
  name: string
  image_id: string
  flavor_id: string
  network_id: string
}

export const vmKeys = {
  all: ['vms'] as const,
  detail: (id: string) => ['vms', id] as const,
  volumes: (id: string) => ['vms', id, 'volumes'] as const,
}

export const useVms = () =>
  useQuery({
    queryKey: vmKeys.all,
    queryFn: () => apiClient.get<Vm[]>('/vms').then((r) => r.data),
  })

export const useVm = (id: string) =>
  useQuery({
    queryKey: vmKeys.detail(id),
    queryFn: () => apiClient.get<Vm>(`/vms/${id}`).then((r) => r.data),
  })

export const useVmVolumes = (id: string) =>
  useQuery({
    queryKey: vmKeys.volumes(id),
    queryFn: () => apiClient.get(`/vms/${id}/volumes`).then((r) => r.data),
  })

export const useCreateVm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateVmBody) =>
      apiClient.post('/vms', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: vmKeys.all }),
  })
}

export const useDeleteVm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/vms/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: vmKeys.all }),
  })
}

export const useStartVm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/vms/${id}/start`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: vmKeys.all }),
  })
}

export const useStopVm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/vms/${id}/stop`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: vmKeys.all }),
  })
}

export const useRebootVm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/vms/${id}/reboot`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: vmKeys.all }),
  })
}
