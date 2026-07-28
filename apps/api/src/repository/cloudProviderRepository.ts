import prisma from '../database/connection.js'

const publicSelect = { id: true, projectId: true, type: true, name: true }

export async function getByProjectId(projectId: number) {
    return prisma.cloudProvider.findMany({ where: { projectId }, select: publicSelect })
}

export async function getById(id: number) {
    return prisma.cloudProvider.findUnique({ where: { id } })
}

export async function create(data: { projectId: number; type: string; name: string; credentials: string }) {
    return prisma.cloudProvider.create({ data, select: publicSelect })
}

export async function remove(id: number) {
    return prisma.cloudProvider.delete({ where: { id } })
}
