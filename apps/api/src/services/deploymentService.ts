import * as deploymentRepository from '../repository/deploymentRepository.js'
import * as cloudProviderService from './cloudProviderService.js'
import * as opentofuWorker from './opentofuWorker.js'
import { NotFoundError } from '../utils/appErrors.js'

function toPublic(deployment: Awaited<ReturnType<typeof deploymentRepository.findById>>) {
    if (!deployment) return deployment
    return { ...deployment, variables: JSON.parse(deployment.variables) }
}

export async function listTemplates() {
    return opentofuWorker.listTemplates()
}

export async function listDeployments() {
    const deployments = await deploymentRepository.findAll()
    return deployments.map(toPublic)
}

export async function getDeployment(id: number) {
    const deployment = await deploymentRepository.findById(id)
    if (!deployment) throw new NotFoundError('Déploiement introuvable')
    return toPublic(deployment)
}

async function requireDeployment(id: number) {
    const deployment = await deploymentRepository.findById(id)
    if (!deployment) throw new NotFoundError('Déploiement introuvable')
    return deployment
}

export async function createDeployment(
    providerId: number,
    templateId: string,
    name: string,
    variables: Record<string, unknown>
) {
    const { credentials } = await cloudProviderService.getDecryptedCredentials(providerId)

    const deployment = await deploymentRepository.create({
        providerId,
        templateId,
        name,
        variables: JSON.stringify(variables),
    })

    const result = await opentofuWorker.createDeployment(deployment.id, templateId, variables, credentials)
    const updated = await deploymentRepository.update(deployment.id, {
        status: result.status,
        planOutput: result.output,
    })
    return toPublic(updated)
}

export async function applyDeployment(id: number) {
    const deployment = await requireDeployment(id)
    const { credentials } = await cloudProviderService.getDecryptedCredentials(deployment.providerId)

    const result = await opentofuWorker.applyDeployment(deployment.id, credentials)
    const updated = await deploymentRepository.update(deployment.id, {
        status: result.status,
        applyOutput: result.output,
    })
    return toPublic(updated)
}

export async function destroyDeployment(id: number) {
    const deployment = await requireDeployment(id)
    const { credentials } = await cloudProviderService.getDecryptedCredentials(deployment.providerId)
    const variables = JSON.parse(deployment.variables)

    const result = await opentofuWorker.destroyDeployment(deployment.id, variables, credentials)
    const updated = await deploymentRepository.update(deployment.id, {
        status: result.status,
        destroyOutput: result.output,
    })
    return toPublic(updated)
}
