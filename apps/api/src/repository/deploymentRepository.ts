import prisma from '../database/connection.js'

export async function create(data: { providerId: number; templateId: string; name: string; variables: string }) {
    return prisma.deployment.create({ data })
}

export async function findAll() {
    return prisma.deployment.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function findById(id: number) {
    return prisma.deployment.findUnique({ where: { id } })
}

export async function update(id: number, data: Partial<{
    status: string
    planOutput: string
    applyOutput: string
    destroyOutput: string
}>) {
    return prisma.deployment.update({ where: { id }, data })
}
