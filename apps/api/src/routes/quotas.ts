import type { FastifyInstance } from 'fastify'
import { getQuotas } from '../services/openstack.js'
import authenticate from '../plugins/authenticate.js'
import { validateQuery, providerIdQuerySchema } from '../utils/validation.js'

export async function quotaRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)
  server.get('/quotas', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await getQuotas(providerId)
    return reply.send({ success: true, data })
  })
}
