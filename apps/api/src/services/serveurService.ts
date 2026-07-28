import * as serveurRepository from '../repository/serveurRepository.js'
import type { ServeurInput } from '../repository/serveurRepository.js'
import * as workerService from './openstack.js'
import { NotFoundError, BadRequestError } from '../utils/appErrors.js'

const HEBERGEMENTS = ['interne', 'public_cloud', 'vps']
const ACTIONS = ['restart', 'stop', 'snapshot', 'update', 'deploy'] as const

export async function listServeurs(clientId?: number) {
    return clientId != null ? serveurRepository.getByClientId(clientId) : serveurRepository.getAll()
}

export async function getServeurById(id: number) {
    const serveur = await serveurRepository.getById(id)
    if (!serveur) throw new NotFoundError('Serveur introuvable')
    return serveur
}

function validateHebergement(hebergement: string) {
    if (!HEBERGEMENTS.includes(hebergement)) {
        throw new BadRequestError(`hebergement invalide : ${hebergement}`)
    }
}

export async function createServeur(input: Partial<ServeurInput> & { name: string; hebergement: string; os: string }) {
    validateHebergement(input.hebergement)
    return serveurRepository.create({
        clientId: input.clientId ?? null,
        name: input.name,
        hebergement: input.hebergement,
        os: input.os,
        distribution: input.distribution ?? null,
        deploymentType: input.deploymentType ?? null,
        cloudProviderId: input.cloudProviderId ?? null,
        cloudVmId: input.cloudVmId ?? null,
        cpu: input.cpu ?? null,
        ram: input.ram ?? null,
        disk: input.disk ?? null,
        ip: input.ip ?? null,
        ssh: input.ssh ?? null,
        rdp: input.rdp ?? null,
        vpn: input.vpn ?? null,
        sauvegardes: input.sauvegardes ?? '[]',
    })
}

export async function updateServeur(id: number, input: Partial<ServeurInput>) {
    await getServeurById(id)
    if (input.hebergement) validateHebergement(input.hebergement)
    return serveurRepository.update(id, input)
}

export async function deleteServeur(id: number) {
    await getServeurById(id)
    await serveurRepository.remove(id)
}

// Pour hebergement="public_cloud", récupère les caractéristiques en live depuis le
// worker (jamais dupliquées en base) plutôt que les valeurs saisies à la main.
// get_vm_by_id (detail) donne le statut/adresses/image, get_vms (liste) donne les
// specs du flavor déjà embarquées (vcpus/ram/disk) — les deux sont combinés ici.
export async function getLiveSpec(id: number) {
    const serveur = await getServeurById(id)
    if (serveur.hebergement !== 'public_cloud' || !serveur.cloudProviderId || !serveur.cloudVmId) {
        return null
    }
    const [detail, list] = await Promise.all([
        workerService.getVmById(serveur.cloudProviderId, serveur.cloudVmId),
        workerService.getVms(serveur.cloudProviderId),
    ])
    const specs = (list as { id: string; flavor: { vcpus: number; ram: number; disk: number } }[])
        .find((vm) => vm.id === serveur.cloudVmId)?.flavor ?? null
    return { ...detail, specs }
}

export async function listEvents(id: number) {
    await getServeurById(id)
    return serveurRepository.getEvents(id)
}

export async function performAction(id: number, action: string) {
    if (!ACTIONS.includes(action as typeof ACTIONS[number])) {
        throw new BadRequestError(`Action inconnue : ${action}`)
    }
    const serveur = await getServeurById(id)

    const isLiveLinked = serveur.hebergement === 'public_cloud' && serveur.cloudProviderId && serveur.cloudVmId
    let message = `Action "${action}" déclenchée`

    if (isLiveLinked && serveur.cloudProviderId && serveur.cloudVmId) {
        if (action === 'restart') {
            await workerService.rebootVm(serveur.cloudProviderId, serveur.cloudVmId)
            message = 'Redémarrage envoyé à OpenStack'
        } else if (action === 'stop') {
            await workerService.stopVm(serveur.cloudProviderId, serveur.cloudVmId)
            message = 'Arrêt envoyé à OpenStack'
        } else {
            message = `Action "${action}" enregistrée (pas encore intégrée à l'API pour ce type d'hébergement)`
        }
    } else {
        message = `Action "${action}" enregistrée manuellement (pas d'API pour cet hébergement)`
    }

    await serveurRepository.addEvent(id, 'log', message)
    return getServeurById(id)
}

export async function addNote(id: number, message: string) {
    await getServeurById(id)
    return serveurRepository.addEvent(id, 'note', message)
}

export async function addIncident(id: number, message: string) {
    await getServeurById(id)
    return serveurRepository.addEvent(id, 'incident', message)
}
