// Communication avec le worker Ansible (exécution de playbooks)

import { config } from '../config/index.js'
import { WorkerError } from '../utils/appErrors.js'

const WORKER_URL = config.ansibleWorkerUrl

async function workerFetch(path: string, options?: RequestInit) {
    try {
        const res = await fetch(`${WORKER_URL}${path}`, options)
        const body = await res.json()
        if (!res.ok) throw new WorkerError(body.detail)
        return body
    } catch (err) {
        if (err instanceof WorkerError) throw err
        throw new WorkerError('Worker Ansible indisponible')
    }
}

export async function listPlaybooks() {
    return workerFetch('/playbooks')
}

// Lance le playbook et retourne dès que le process a démarré (statut "running"),
// sans attendre la fin de l'exécution — le suivi se fait via getRunLog.
export async function startRun(
    runId: number,
    playbookId: string,
    hosts: { name: string; ip: string }[],
    sshUser: string
) {
    return workerFetch('/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_id: String(runId), playbook_id: playbookId, hosts, ssh_user: sshUser }),
    })
}

export async function getRunLog(runId: number): Promise<{ status: string; output: string }> {
    return workerFetch(`/runs/${runId}/log`)
}
