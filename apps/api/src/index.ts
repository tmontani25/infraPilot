import Fastify from 'fastify'
import { healthRoutes } from './routes/health.js'

const server = Fastify({ logger: true })

server.register(healthRoutes)



server.listen({ port: 3000, host: '0.0.0.0' }, (err, _address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})
