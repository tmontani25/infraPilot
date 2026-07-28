import prisma from '../database/connection.js'

export async function getByClientId(clientId: number) {
    return prisma.project.findMany({ where: { clientId } })
}

export async function getIndependent() {
    return prisma.project.findMany({ where: { clientId: null } })
}

export async function getById(id: number) {
    return prisma.project.findUnique({ where: { id } })
}

export async function create(clientId: number | null, name: string) {
    return prisma.project.create({ data: { clientId, name } })
}

export async function updateClientId(id: number, clientId: number | null) {
    return prisma.project.update({ where: { id }, data: { clientId } })
}

export async function remove(id: number) {
    return prisma.project.delete({ where: { id } })
}
