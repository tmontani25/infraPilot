import * as playbookRunRepository from '../repository/playbookRunRepository.js'
import * as openstackService from './openstack.js'
import * as ansibleWorker from './ansibleWorker.js'
import { BadRequestError, NotFoundError } from '../utils/appErrors.js'

type VmAddress = { addr: string; version: number; 'OS-EXT-IPS:type': string }

function toPublic(run: Awaited<ReturnType<typeof playbookRunRepository.findById>>) {
    if (!run) return run
    return { ...run, targetVms: JSON.parse(run.targetVms) }
}

export async function listPlaybooks() {
    return ansibleWorker.listPlaybooks()
}

export async function listRuns() {
    const runs = await playbookRunRepository.findAll()
    return runs.map(toPublic)
}

export async function getRun(id: number) {
    const run = await playbookRunRepository.findById(id)
    if (!run) throw new NotFoundError('Exécution introuvable')
    return toPublic(run)
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

    const result = await ansibleWorker.runPlaybook(run.id, playbookId, hosts.map(h => ({ name: h.name, ip: h.ip })), sshUser)
    const updated = await playbookRunRepository.update(run.id, { status: result.status, output: result.output })
    return toPublic(updated)
}
