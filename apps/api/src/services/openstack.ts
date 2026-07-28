// Toute la communication avec les workers cloud (OpenStack/Proxmox/Hetzner), appels http centralisés

import { config } from '../config/index.js'
import { WorkerError, BadRequestError } from '../utils/appErrors.js'
import * as cloudProviderService from './cloudProviderService.js'

type WorkerType = keyof typeof config.workers

function getWorkerUrl(type: string): string {
  const url = config.workers[type as WorkerType]
  if (!url) throw new BadRequestError(`Type de provider inconnu: ${type}`)
  return url
}

// résout le provider choisi, récupère ses credentials déchiffrés et appelle le bon worker avec
async function workerFetch(providerId: number, path: string, options?: RequestInit) {
  const { type, credentials } = await cloudProviderService.getDecryptedCredentials(providerId)
  const workerUrl = getWorkerUrl(type)

  try {
    const res = await fetch(`${workerUrl}${path}`, {
      ...options,
      headers: {
        ...options?.headers,
        'X-Provider-Credentials': JSON.stringify(credentials),
      },
    })
    if (!res.ok) {
      const body = await res.json()
      throw new WorkerError(body.detail)
    }
    return res.json()
  } catch (err) {
    if (err instanceof WorkerError) throw err
    throw new WorkerError('Worker indisponible')
  }
}

// Project
export async function getProject(providerId: number) {
  return workerFetch(providerId, '/project')
}

// VMs
export async function getVms(providerId: number) {
  return workerFetch(providerId, '/vms')
}

export async function getVmById(providerId: number, id: string) {
  return workerFetch(providerId, `/vms/${id}`)
}

export async function createVm(providerId: number, body: { name: string; image_id: string; flavor_id: string; network_id: string }) {
  return workerFetch(providerId, '/vms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function deleteVm(providerId: number, id: string) {
  return workerFetch(providerId, `/vms/${id}`, { method: 'DELETE' })
}

export async function startVm(providerId: number, id: string) {
  return workerFetch(providerId, `/vms/${id}/start`, { method: 'POST' })
}

export async function stopVm(providerId: number, id: string) {
  return workerFetch(providerId, `/vms/${id}/stop`, { method: 'POST' })
}

export async function rebootVm(providerId: number, id: string) {
  return workerFetch(providerId, `/vms/${id}/reboot`, { method: 'POST' })
}

export async function getVmVolumes(providerId: number, id: string) {
  return workerFetch(providerId, `/vms/${id}/volumes`)
}

// Volumes
export async function getVolumes(providerId: number) {
  return workerFetch(providerId, '/volumes')
}

export async function getVolumeById(providerId: number, id: string) {
  return workerFetch(providerId, `/volumes/${id}`)
}

export async function deleteVolume(providerId: number, id: string) {
  return workerFetch(providerId, `/volumes/${id}`, { method: 'DELETE' })
}

// Quotas
export async function getQuotas(providerId: number) {
  return workerFetch(providerId, '/quotas')
}

// Resources
export async function getNetworks(providerId: number) {
  return workerFetch(providerId, '/networks')
}

export async function getImages(providerId: number) {
  return workerFetch(providerId, '/images')
}

export async function getFlavors(providerId: number) {
  return workerFetch(providerId, '/flavors')
}

export async function getSubnets(providerId: number) {
  return workerFetch(providerId, '/subnets')
}

export async function getSecurityGroups(providerId: number) {
  return workerFetch(providerId, '/security-groups')
}

export async function getKeypairs(providerId: number) {
  return workerFetch(providerId, '/keypairs')
}
