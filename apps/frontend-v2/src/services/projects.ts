import { api } from '../lib/apiClient'
import type { Project } from '../types'

export async function getProjects(clientId: number): Promise<Project[]> {
  const { data } = await api.get(`/clients/${clientId}/projects`)
  return data.data.projects
}

export async function getIndependentProjects(): Promise<Project[]> {
  const { data } = await api.get('/projects/independent')
  return data.data.projects
}

export async function getProject(id: number): Promise<Project> {
  const { data } = await api.get(`/projects/${id}`)
  return data.data.project
}

export async function createProject(clientId: number, name: string): Promise<Project> {
  const { data } = await api.post(`/clients/${clientId}/projects`, { name })
  return data.data.project
}

export async function createIndependentProject(name: string): Promise<Project> {
  const { data } = await api.post('/projects/independent', { name })
  return data.data.project
}

export async function moveProject(id: number, clientId: number | null): Promise<Project> {
  const { data } = await api.patch(`/projects/${id}`, { clientId })
  return data.data.project
}

export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/projects/${id}`)
}
