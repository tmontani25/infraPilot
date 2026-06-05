import type { FastifyInstance } from 'fastify'
import { getQuotas } from '../services/worker.js'
import authenticate from '../plugins/authenticate.js'

export async function quotaRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)
  server.get('/quotas', async (_req, reply) => {
    const data = await getQuotas()
    return reply.send({ success: true, data })
  })
}
