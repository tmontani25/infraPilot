import type { User } from '../generated/prisma/index.js'

export type PublicUser = Omit<User, 'passwordHash'>
