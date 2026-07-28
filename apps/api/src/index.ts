import 'dotenv/config'
import Fastify from 'fastify'
import { healthRoutes } from './routes/health.js'
import { projectRoutes } from './routes/project.js'
import { vmRoutes } from './routes/vms.js'
import { ressourceRoutes } from './routes/ressource.js'
import authRoutes from './routes/auth.js'
import { volumeRoutes } from './routes/volumes.js'
import { quotaRoutes } from './routes/quotas.js'
import { clientRoutes } from './routes/clients.js'
import { cloudProviderRoutes } from './routes/cloudProviders.js'
import { deploymentRoutes } from './routes/deployments.js'
import { errorHandler, notFoundHandler } from './utils/errorHandler.js'
import { config } from './config/index.js'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'

const server = Fastify({ logger: true })

server.setErrorHandler(errorHandler)
server.setNotFoundHandler(notFoundHandler)

server.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})

server.register(cookie)

if (!process.env.JWT_SECRET){
  throw new Error ('JWT_SECRET manquant dans .env')
}
server.register(jwt, {
  secret: process.env.JWT_SECRET!,
  cookie: { cookieName: 'token', signed: false }
})

server.register(vmRoutes, { prefix: '/api/v1' })
server.register(healthRoutes, { prefix: '/api/v1' })
server.register(projectRoutes, { prefix: '/api/v1' })
server.register(ressourceRoutes, { prefix: '/api/v1' })
server.register(volumeRoutes, { prefix: '/api/v1' })
server.register(authRoutes, { prefix: '/api/v1' })
server.register(quotaRoutes, { prefix: '/api/v1' })
server.register(clientRoutes, { prefix: '/api/v1' })
server.register(cloudProviderRoutes, { prefix: '/api/v1' })
server.register(deploymentRoutes, { prefix: '/api/v1' })



server.listen({ port: config.port, host: '0.0.0.0' }, (err, _address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})
