import prisma from '../database/connection.js'

export async function getAll() {
    return prisma.client.findMany()
}

export async function getById(id: number) {
    return prisma.client.findUnique({ where: { id } })
}

export async function create(name: string) {
    return prisma.client.create({ data: { name } })
}

export async function remove(id: number) {
    return prisma.client.delete({ where: { id } })
}
