import * as projectRepository from '../repository/projectRepository.js'
import { NotFoundError } from '../utils/appErrors.js'

export async function listProjects(clientId: number) {
    return projectRepository.getByClientId(clientId)
}

export async function getProjectById(id: number) {
    const project = await projectRepository.getById(id)
    if (!project) throw new NotFoundError('Projet introuvable')
    return project
}

export async function createProject(clientId: number, name: string) {
    return projectRepository.create(clientId, name)
}

export async function deleteProject(id: number) {
    await getProjectById(id)
    await projectRepository.remove(id)
}
