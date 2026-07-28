// Communication avec le worker OpenTofu (exécution de tofu init/plan/apply/destroy)

import { config } from '../config/index.js'
import { WorkerError } from '../utils/appErrors.js'

const WORKER_URL = config.opentofuWorkerUrl

async function workerFetch(path: string, credentials: Record<string, unknown> | null, options?: RequestInit) {
    try {
        const res = await fetch(`${WORKER_URL}${path}`, {
            ...options,
            headers: {
                ...options?.headers,
                ...(credentials ? { 'X-Provider-Credentials': JSON.stringify(credentials) } : {}),
            },
        })
        const body = await res.json()
        if (!res.ok) throw new WorkerError(body.detail)
        return body
    } catch (err) {
        if (err instanceof WorkerError) throw err
        throw new WorkerError('Worker OpenTofu indisponible')
    }
}

export async function listTemplates() {
    return workerFetch('/templates', null)
}

export async function createDeployment(
    deploymentId: number,
    templateId: string,
    variables: Record<string, unknown>,
    credentials: Record<string, unknown>
) {
    return workerFetch('/deployments', credentials, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deployment_id: String(deploymentId), template_id: templateId, variables }),
    })
}

export async function applyDeployment(deploymentId: number, credentials: Record<string, unknown>) {
    return workerFetch(`/deployments/${deploymentId}/apply`, credentials, { method: 'POST' })
}

export async function destroyDeployment(
    deploymentId: number,
    variables: Record<string, unknown>,
    credentials: Record<string, unknown>
) {
    return workerFetch(`/deployments/${deploymentId}/destroy`, credentials, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables }),
    })
}
