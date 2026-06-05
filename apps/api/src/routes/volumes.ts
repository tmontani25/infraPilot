import type { FastifyInstance } from 'fastify'
import * as workerService from '../services/worker.js'
import authenticate from '../plugins/authenticate.js'
export async function volumeRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)

  server.get('/volumes', async (_req, reply) => {
    const data = await workerService.getVolumes()
    return reply.send(data)
  })

  server.get('/volumes/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = await workerService.getVolumeById(id)
    return reply.send(data)
  })

  server.delete('/volumes/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = await workerService.deleteVolume(id)
    return reply.send(data)
  })
}
