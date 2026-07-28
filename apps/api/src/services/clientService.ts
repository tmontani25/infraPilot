import * as clientRepository from '../repository/clientRepository.js'
import * as projectRepository from '../repository/projectRepository.js'
import { NotFoundError, ConflictError } from '../utils/appErrors.js'

export async function getAllClients() {
    return clientRepository.getAll()
}

export async function getClientById(id: number) {
    const client = await clientRepository.getById(id)
    if (!client) throw new NotFoundError('Client introuvable')
    return client
}

export async function createClient(name: string) {
    return clientRepository.create(name)
}

export async function updateClient(id: number, name: string) {
    await getClientById(id)
    return clientRepository.update(id, name)
}

export async function deleteClient(id: number) {
    const client = await getClientById(id)

    const projects = await projectRepository.getByClientId(id)
    if (projects.length > 0) {
        throw new ConflictError(
            `Impossible de supprimer "${client.name}" : ${projects.length} projet(s) y sont encore rattaché(s). Supprime-les d'abord.`
        )
    }

    await clientRepository.remove(id)
}
