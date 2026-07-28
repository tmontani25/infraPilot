import * as projectRepository from '../repository/projectRepository.js'
import * as cloudProviderRepository from '../repository/cloudProviderRepository.js'
import * as clientRepository from '../repository/clientRepository.js'
import { NotFoundError, ConflictError } from '../utils/appErrors.js'

export async function listProjects(clientId: number) {
    return projectRepository.getByClientId(clientId)
}

export async function listIndependentProjects() {
    return projectRepository.getIndependent()
}

export async function getProjectById(id: number) {
    const project = await projectRepository.getById(id)
    if (!project) throw new NotFoundError('Projet introuvable')
    return project
}

export async function createProject(clientId: number, name: string) {
    return projectRepository.create(clientId, name)
}

export async function createIndependentProject(name: string) {
    return projectRepository.create(null, name)
}

export async function moveProject(id: number, clientId: number | null) {
    await getProjectById(id)

    if (clientId != null) {
        const client = await clientRepository.getById(clientId)
        if (!client) throw new NotFoundError('Client introuvable')
    }

    return projectRepository.updateClientId(id, clientId)
}

export async function deleteProject(id: number) {
    const project = await getProjectById(id)

    const providers = await cloudProviderRepository.getByProjectId(id)
    if (providers.length > 0) {
        throw new ConflictError(
            `Impossible de supprimer "${project.name}" : ${providers.length} compte(s) cloud y sont encore rattaché(s).`
        )
    }

    await projectRepository.remove(id)
}
