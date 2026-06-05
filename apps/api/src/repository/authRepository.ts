import prisma from '../database/connection.js'

export async function getUserWithPasswordByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
}

export async function getUserWithPasswordByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } })
}
