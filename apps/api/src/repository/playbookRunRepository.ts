import prisma from '../database/connection.js'

export async function create(data: { providerId: number; playbookId: string; name: string; targetVms: string; sshUser: string }) {
    return prisma.playbookRun.create({ data })
}

export async function findAll() {
    return prisma.playbookRun.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function findById(id: number) {
    return prisma.playbookRun.findUnique({ where: { id } })
}

export async function update(id: number, data: Partial<{ status: string; output: string }>) {
    return prisma.playbookRun.update({ where: { id }, data })
}
