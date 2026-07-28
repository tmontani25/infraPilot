import { api } from '../lib/apiClient'
import type { DeploymentTemplate, Deployment } from '../types'

export async function getTemplates(): Promise<DeploymentTemplate[]> {
  const { data } = await api.get('/templates')
  return data.data.templates
}

export async function getDeployments(): Promise<Deployment[]> {
  const { data } = await api.get('/deployments')
  return data.data.deployments
}

export async function createDeployment(
  templateId: string,
  name: string,
  variables: Record<string, string>
): Promise<Deployment> {
  const { data } = await api.post('/deployments', { templateId, name, variables })
  return data.data.deployment
}

export async function applyDeployment(id: number): Promise<Deployment> {
  const { data } = await api.post(`/deployments/${id}/apply`)
  return data.data.deployment
}

export async function destroyDeployment(id: number): Promise<Deployment> {
  const { data } = await api.post(`/deployments/${id}/destroy`)
  return data.data.deployment
}
