import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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

export type OsImage = { id: string; name: string }
export type OsFlavor = { id: string; name: string; vcpus: number; ram: number; disk: number }
export type OsNetwork = { id: string; name: string }

export const vmKeys = {
  all: ['vms'] as const,
  detail: (id: string) => ['vms', id] as const,
  volumes: (id: string) => ['vms', id, 'volumes'] as const,
}

export const useImages = () =>
  useQuery({
    queryKey: ['images'] as const,
    queryFn: () => apiClient.get<OsImage[]>('/images').then((r) => r.data),
  })

export const useFlavors = () =>
  useQuery({
    queryKey: ['flavors'] as const,
    queryFn: () => apiClient.get<OsFlavor[]>('/flavors').then((r) => r.data),
  })

export const useNetworks = () =>
  useQuery({
    queryKey: ['networks'] as const,
    queryFn: () => apiClient.get<OsNetwork[]>('/networks').then((r) => r.data),
  })

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vmKeys.all })
      toast.success('VM créée avec succès')
    },
  })
}

export const useDeleteVm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/vms/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vmKeys.all })
      toast.success('VM supprimée')
    },
  })
}

export const useStartVm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/vms/${id}/start`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vmKeys.all })
      toast.success('VM démarrée')
    },
  })
}

export const useStopVm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/vms/${id}/stop`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vmKeys.all })
      toast.success('VM arrêtée')
    },
  })
}

export const useRebootVm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/vms/${id}/reboot`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vmKeys.all })
      toast.success('VM redémarrée')
    },
  })
}
