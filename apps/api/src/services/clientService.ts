import * as clientRepository from '../repository/clientRepository.js'
import { NotFoundError } from '../utils/appErrors.js'

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

export async function deleteClient(id: number) {
    await getClientById(id)
    await clientRepository.remove(id)
}
