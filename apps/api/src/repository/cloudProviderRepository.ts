import prisma from '../database/connection.js'

const publicSelect = { id: true, clientId: true, type: true, name: true }

export async function getByClientId(clientId: number) {
    return prisma.cloudProvider.findMany({ where: { clientId }, select: publicSelect })
}

export async function getById(id: number) {
    return prisma.cloudProvider.findUnique({ where: { id } })
}

export async function create(data: { clientId: number; type: string; name: string; credentials: string }) {
    return prisma.cloudProvider.create({ data, select: publicSelect })
}

export async function remove(id: number) {
    return prisma.cloudProvider.delete({ where: { id } })
}
