import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'

export type Volume = {
  id: string
  name: string
  size: number
  status: string
  attachments?: { server_id: string; device: string }[]
}

export const volumeKeys = {
  all: ['volumes'] as const,
  detail: (id: string) => ['volumes', id] as const,
}

export const useVolumes = () =>
  useQuery({
    queryKey: volumeKeys.all,
    queryFn: () => apiClient.get<Volume[]>('/volumes').then((r) => r.data),
  })

export const useVolume = (id: string) =>
  useQuery({
    queryKey: volumeKeys.detail(id),
    queryFn: () =>
      apiClient.get<Volume>(`/volumes/${id}`).then((r) => r.data),
  })

export const useDeleteVolume = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/volumes/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volumeKeys.all })
      toast.success('Volume supprimé')
    },
  })
}
