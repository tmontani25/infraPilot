import type { FastifyInstance } from 'fastify'
import { getProject } from '../services/worker.js'

export async function projectRoutes(server: FastifyInstance) {
  server.get('/project', async (_request, _reply) => {
    return getProject()
  })
}
