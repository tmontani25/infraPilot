import prisma from '../database/connection.js'

export async function getAll() {
    return prisma.serveur.findMany({ orderBy: { name: 'asc' } })
}

export async function getByClientId(clientId: number) {
    return prisma.serveur.findMany({ where: { clientId }, orderBy: { name: 'asc' } })
}

export async function getByCloudProviderId(cloudProviderId: number) {
    return prisma.serveur.findMany({ where: { cloudProviderId }, orderBy: { name: 'asc' } })
}

export async function getById(id: number) {
    return prisma.serveur.findUnique({ where: { id } })
}

export type ServeurInput = {
    clientId: number | null
    name: string
    hebergement: string
    os: string
    distribution: string | null
    deploymentType: string | null
    cloudProviderId: number | null
    cloudVmId: string | null
    cpu: number | null
    ram: number | null
    disk: number | null
    ip: string | null
    ssh: string | null
    rdp: string | null
    vpn: string | null
    sauvegardes: string
}

export async function create(data: ServeurInput) {
    return prisma.serveur.create({ data })
}

export async function update(id: number, data: Partial<ServeurInput>) {
    return prisma.serveur.update({ where: { id }, data })
}

export async function remove(id: number) {
    return prisma.serveur.delete({ where: { id } })
}

export async function getEvents(serveurId: number) {
    return prisma.serveurEvent.findMany({ where: { serveurId }, orderBy: { createdAt: 'desc' } })
}

export async function addEvent(serveurId: number, type: string, message: string) {
    return prisma.serveurEvent.create({ data: { serveurId, type, message } })
}
