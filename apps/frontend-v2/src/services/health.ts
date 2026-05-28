import { api } from '../lib/apiClient'

export async function getProject(): Promise<{ project_name: string | null }> {
  const { data } = await api.get('/project')
  return data
}
