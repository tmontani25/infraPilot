import { api } from '../lib/apiClient'
import type { Playbook, PlaybookRun } from '../types'

export async function getPlaybooks(): Promise<Playbook[]> {
  const { data } = await api.get('/playbooks')
  return data.data.playbooks
}

export async function getPlaybookRuns(): Promise<PlaybookRun[]> {
  const { data } = await api.get('/playbook-runs')
  return data.data.runs
}

export async function createPlaybookRun(
  playbookId: string,
  name: string,
  vmIds: string[],
  sshUser: string
): Promise<PlaybookRun> {
  const { data } = await api.post('/playbook-runs', { playbookId, name, vmIds, sshUser })
  return data.data.run
}

export async function retryPlaybookRun(id: number): Promise<PlaybookRun> {
  const { data } = await api.post(`/playbook-runs/${id}/retry`)
  return data.data.run
}
