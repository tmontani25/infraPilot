import type { FastifyInstance } from 'fastify'
import { getProject } from '../services/openstack.js'
import authenticate from '../plugins/authenticate.js'
import { validateQuery, providerIdQuerySchema } from '../utils/validation.js'

export async function projectRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)
  server.get('/project', async (request, _reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, request.query)
    return getProject(providerId)
  })
}
