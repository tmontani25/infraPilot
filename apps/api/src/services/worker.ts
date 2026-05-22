//toute la communication avec le worker appels http

import { config } from '../config/index.js'
import { WorkerError } from '../utils/appErrors.js'

const WORKER_URL = config.workerUrl

//centralise les appels au worker et gere les erreures
async function workerFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options)
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

// VMs
export async function getVms() {
  return workerFetch(`${WORKER_URL}/vms`)
}

export async function getVmById(id: string) {
  return workerFetch(`${WORKER_URL}/vms/${id}`)
}

export async function createVm(body: { name: string; image_id: string; flavor_id: string; network_id: string }) {
  return workerFetch(`${WORKER_URL}/vms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function deleteVm(id: string) {
  return workerFetch(`${WORKER_URL}/vms/${id}`, { method: 'DELETE' })
}

export async function startVm(id: string) {
  return workerFetch(`${WORKER_URL}/vms/${id}/start`, { method: 'POST' })
}

export async function stopVm(id: string) {
  return workerFetch(`${WORKER_URL}/vms/${id}/stop`, { method: 'POST' })
}

export async function rebootVm(id: string) {
  return workerFetch(`${WORKER_URL}/vms/${id}/reboot`, { method: 'POST' })
}

export async function getVmVolumes(id: string) {
  return workerFetch(`${WORKER_URL}/vms/${id}/volumes`)
}

// Volumes
export async function getVolumes() {
  return workerFetch(`${WORKER_URL}/volumes`)
}

export async function getVolumeById(id: string) {
  return workerFetch(`${WORKER_URL}/volumes/${id}`)
}

export async function deleteVolume(id: string) {
  return workerFetch(`${WORKER_URL}/volumes/${id}`, { method: 'DELETE' })
}

// Resources
export async function getNetworks() {
  return workerFetch(`${WORKER_URL}/networks`)
}

export async function getImages() {
  return workerFetch(`${WORKER_URL}/images`)
}

export async function getFlavors() {
  return workerFetch(`${WORKER_URL}/flavors`)
}

export async function getSubnets() {
  return workerFetch(`${WORKER_URL}/subnets`)
}

export async function getSecurityGroups() {
  return workerFetch(`${WORKER_URL}/security-groups`)
}

export async function getKeypairs() {
  return workerFetch(`${WORKER_URL}/keypairs`)
}
