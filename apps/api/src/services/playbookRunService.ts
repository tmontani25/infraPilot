import * as playbookRunRepository from '../repository/playbookRunRepository.js'
import * as openstackService from './openstack.js'
import * as ansibleWorker from './ansibleWorker.js'
import { BadRequestError, NotFoundError } from '../utils/appErrors.js'

type VmAddress = { addr: string; version: number; 'OS-EXT-IPS:type': string }
type Run = NonNullable<Awaited<ReturnType<typeof playbookRunRepository.findById>>>

function toPublic(run: Run) {
    return { ...run, targetVms: JSON.parse(run.targetVms) }
}

// Le worker garde l'état d'avancement (log + statut) en mémoire/fichier tant que le run
// tourne. Tant qu'un run n'est pas dans un état terminal en base, on va chercher l'état
// à jour côté worker et on le répercute en base — c'est ce qui donne les logs "temps réel"
// sans avoir besoin de websocket : le frontend poll cette même route toutes les ~1.5s.
async function syncIfRunning(run: Run): Promise<Run> {
    if (run.status !== 'running') return run
    try {
        const { status, output } = await ansibleWorker.getRunLog(run.id)
        if (status === run.status && output === run.output) return run
        return await playbookRunRepository.update(run.id, { status, output })
    } catch {
        // worker temporairement injoignable : on garde l'état connu plutôt que de casser l'affichage
        return run
    }
}

export async function listPlaybooks() {
    return ansibleWorker.listPlaybooks()
}

export async function listRuns() {
    const runs = await playbookRunRepository.findAll()
    const synced = await Promise.all(runs.map(syncIfRunning))
    return synced.map(toPublic)
}

export async function getRun(id: number) {
    const run = await playbookRunRepository.findById(id)
    if (!run) throw new NotFoundError('Exécution introuvable')
    return toPublic(await syncIfRunning(run))
}

// préfère l'IP flottante (joignable depuis internet) à défaut de l'IP fixe interne
function extractIp(addresses: Record<string, VmAddress[]>): string | null {
    const allIps = Object.values(addresses).flat()
    const floating = allIps.find(a => a['OS-EXT-IPS:type'] === 'floating')
    return floating?.addr ?? allIps[0]?.addr ?? null
}

export async function createRun(
    providerId: number,
    playbookId: string,
    name: string,
    vmIds: string[],
    sshUser: string
) {
    if (vmIds.length === 0) throw new BadRequestError('Sélectionne au moins une VM cible')

    const vmDetails = await Promise.all(vmIds.map(id => openstackService.getVmById(providerId, id)))
    const hosts = vmDetails.map(vm => {
        const ip = extractIp(vm.addresses)
        if (!ip) throw new BadRequestError(`La VM ${vm.name} n'a pas d'adresse IP`)
        return { id: vm.id, name: vm.name, ip }
    })

    const run = await playbookRunRepository.create({
        providerId,
        playbookId,
        name,
        targetVms: JSON.stringify(hosts),
        sshUser,
    })

    return launchAndTrack(run, playbookId, hosts.map(h => ({ name: h.name, ip: h.ip })), sshUser)
}

// Relance le même playbook sur les mêmes cibles qu'un run existant (reprise manuelle sur erreur)
export async function retryRun(id: number) {
    const original = await playbookRunRepository.findById(id)
    if (!original) throw new NotFoundError('Exécution introuvable')

    const hosts = JSON.parse(original.targetVms) as { id: string; name: string; ip: string }[]
    const run = await playbookRunRepository.create({
        providerId: original.providerId,
        playbookId: original.playbookId,
        name: original.name,
        targetVms: original.targetVms,
        sshUser: original.sshUser,
    })

    return launchAndTrack(run, original.playbookId, hosts.map(h => ({ name: h.name, ip: h.ip })), original.sshUser)
}

async function launchAndTrack(
    run: Run,
    playbookId: string,
    hosts: { name: string; ip: string }[],
    sshUser: string
) {
    const result = await ansibleWorker.startRun(run.id, playbookId, hosts, sshUser)
    const updated = await playbookRunRepository.update(run.id, { status: result.status, output: result.output ?? '' })
    return toPublic(updated)
}
