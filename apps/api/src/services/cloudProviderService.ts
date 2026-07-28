import * as cloudProviderRepository from '../repository/cloudProviderRepository.js'
import * as deploymentRepository from '../repository/deploymentRepository.js'
import { encrypt, decrypt } from '../utils/crypto.js'
import { NotFoundError, ConflictError } from '../utils/appErrors.js'

// credentials n'est jamais renvoyé au frontend, uniquement utilisé en interne pour appeler le worker
export async function createCloudProvider(projectId: number, type: string, name: string, credentials: Record<string, unknown>) {
    const encrypted = encrypt(credentials)
    return cloudProviderRepository.create({ projectId, type, name, credentials: encrypted })
}

export async function listCloudProviders(projectId: number) {
    return cloudProviderRepository.getByProjectId(projectId)
}

export async function getDecryptedCredentials(id: number) {
    const provider = await cloudProviderRepository.getById(id)
    if (!provider) throw new NotFoundError('Cloud provider introuvable')
    return { type: provider.type, credentials: decrypt<Record<string, unknown>>(provider.credentials) }
}

export async function renameCloudProvider(id: number, name: string) {
    const provider = await cloudProviderRepository.getById(id)
    if (!provider) throw new NotFoundError('Cloud provider introuvable')
    return cloudProviderRepository.updateName(id, name)
}

export async function deleteCloudProvider(id: number) {
    const provider = await cloudProviderRepository.getById(id)
    if (!provider) throw new NotFoundError('Cloud provider introuvable')

    const deployments = await deploymentRepository.findByProviderId(id)
    if (deployments.length > 0) {
        throw new ConflictError(
            `Impossible de supprimer "${provider.name}" : ${deployments.length} déploiement(s) y sont encore rattaché(s).`
        )
    }

    await cloudProviderRepository.remove(id)
}
