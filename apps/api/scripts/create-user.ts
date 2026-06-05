// Usage: tsx scripts/create-user.ts --username alice --email alice@boite.com --password secretpass [--role admin]
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '../src/database/connection.js'

const schema = z.object({
  username: z.string().min(1, 'username requis'),
  email: z.string().email('email invalide'),
  password: z.string().min(8, 'password min 8 caractères'),
  role: z.enum(['member', 'admin']).default('member'),
})

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`)
  return idx !== -1 ? process.argv[idx + 1] : undefined
}

const parsed = schema.safeParse({
  username: arg('username'),
  email: arg('email'),
  password: arg('password'),
  role: arg('role'),
})

if (!parsed.success) {
  const errors = parsed.error.issues.map(e => `  --${e.path[0]}: ${e.message}`).join('\n')
  console.error(`Erreurs de validation:\n${errors}`)
  process.exit(1)
}

const { username, email, password, role } = parsed.data
const passwordHash = await bcrypt.hash(password, 12)

const user = await prisma.user.create({
  data: { username, email, passwordHash, role },
  select: { id: true, username: true, email: true, role: true },
})

await prisma.$disconnect()
console.log('Compte créé:', user)
