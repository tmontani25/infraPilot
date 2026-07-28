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

export type ClientUpdateInput = Partial<{
    name: string
    address: string | null
    contacts: string | null
    contrats: string | null
}>

export async function update(id: number, data: ClientUpdateInput) {
    return prisma.client.update({ where: { id }, data })
}

export async function remove(id: number) {
    return prisma.client.delete({ where: { id } })
}
