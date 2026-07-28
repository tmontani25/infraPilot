import { api } from '../lib/apiClient'
import type { Project } from '../types'

export async function getProjects(clientId: number): Promise<Project[]> {
  const { data } = await api.get(`/clients/${clientId}/projects`)
  return data.data.projects
}

export async function createProject(clientId: number, name: string): Promise<Project> {
  const { data } = await api.post(`/clients/${clientId}/projects`, { name })
  return data.data.project
}

export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/projects/${id}`)
}
