
export const config = {
  workerUrl: process.env.WORKER_URL ?? 'http://localhost:8000/api/v1',
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET ?? '',
  mode: process.env.MODE ?? 'dev'
}

export const isDev = process.env.MODE === 'dev'
export const isProd = process.env.MODE === 'production'


