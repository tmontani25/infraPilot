import prisma from '../database/connection.js'
import type { PublicUser } from '../types/user.js'

const publicSelect = { id: true, username: true, email: true, role: true }

export async function getAll(): Promise<PublicUser[]> {
    return prisma.user.findMany({ select: publicSelect })
}

export async function getById(id: number): Promise<PublicUser | null> {
    return prisma.user.findUnique({ where: { id }, select: publicSelect })
}

export async function getByUsername(username: string): Promise<PublicUser | null> {
    return prisma.user.findUnique({ where: { username }, select: publicSelect })
}

export async function createUser(data: { username: string; email: string; passwordHash: string }): Promise<PublicUser> {
    return prisma.user.create({ data, select: publicSelect })
}
