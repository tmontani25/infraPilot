import bcrypt from 'bcryptjs'
import { createUser } from '../repository/usersRepository.js'
import { getUserWithPasswordByEmail } from '../repository/authRepository.js'
import { UnauthorizedError } from '../utils/appErrors.js'
import { validateBody, registerSchema, loginSchema } from '../utils/validation.js'
import { PublicUser } from '../types/user.js'

const SALT_ROUNDS = 12

export async function register(
    username: string,
    email: string,
    password: string
): Promise<{ user: PublicUser; payload: { id: number; username: string } }> {
    validateBody(registerSchema, { username, email, password })

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await createUser({ username, email, passwordHash })

    const payload = { id: user.id, username: user.username }
    return { user, payload }
}

export async function login(
    email: string,
    password: string
): Promise<{ user: PublicUser; payload: { id: number; username: string } }> {
    validateBody(loginSchema, { email, password })

    const userWithHash = await getUserWithPasswordByEmail(email)
    if (!userWithHash) {
        throw new UnauthorizedError('Invalid credentials')
    }

    const passwordMatch = await bcrypt.compare(password, userWithHash.passwordHash)
    if (!passwordMatch) {
        throw new UnauthorizedError('Invalid credentials')
    }

    const payload = { id: userWithHash.id, username: userWithHash.username }
    const publicUser: PublicUser = {
        id: userWithHash.id,
        username: userWithHash.username,
        email: userWithHash.email,
        role: userWithHash.role,
    }
    return { user: publicUser, payload }
}

export function logout(_userId: number): void {}
