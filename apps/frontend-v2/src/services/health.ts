import { api } from '../lib/apiClient'

export async function getProject(): Promise<{ project_name: string | null }> {
  const { data } = await api.get('/project')
  return data
}

// Récupère le vrai nom du tenant OpenStack d'un compte cloud précis (pas forcément
// celui actif), pour vérifier qu'il ne diverge pas du nom donné en interne.
export async function getProjectForProvider(providerId: number): Promise<{ project_name: string | null }> {
  const { data } = await api.get('/project', { params: { providerId } })
  return data
}
