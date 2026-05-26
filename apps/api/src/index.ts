import 'dotenv/config'
import Fastify from 'fastify'
import { healthRoutes } from './routes/health.js'
import { vmRoutes } from './routes/vms.js'
import { ressourceRoutes } from './routes/ressource.js'
import { volumeRoutes } from './routes/volumes.js'
import { errorHandler, notFoundHandler } from './utils/errorHandler.js'
import { config } from './config/index.js'
import cors from '@fastify/cors'


const server = Fastify({ logger: true })

server.setErrorHandler(errorHandler)
server.setNotFoundHandler(notFoundHandler)

server.register(cors, { origin: true })

server.register(vmRoutes, { prefix: '/api/v1' })
server.register(healthRoutes, { prefix: '/api/v1' })
server.register(ressourceRoutes, { prefix: '/api/v1' })
server.register(volumeRoutes, { prefix: '/api/v1' })




server.listen({ port: config.port, host: '0.0.0.0' }, (err, _address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})
