import type { FastifyInstance } from 'fastify'
import { getProject } from '../services/openstack.js'
import authenticate from '../plugins/authenticate.js'

export async function projectRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)
  server.get('/project', async (_request, _reply) => {
    return getProject()
  })
}
