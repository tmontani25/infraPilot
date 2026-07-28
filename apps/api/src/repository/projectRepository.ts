import prisma from '../database/connection.js'

export async function getByClientId(clientId: number) {
    return prisma.project.findMany({ where: { clientId } })
}

export async function getById(id: number) {
    return prisma.project.findUnique({ where: { id } })
}

export async function create(clientId: number, name: string) {
    return prisma.project.create({ data: { clientId, name } })
}

export async function remove(id: number) {
    return prisma.project.delete({ where: { id } })
}
