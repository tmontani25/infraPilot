import type { FastifyInstance } from 'fastify'
import * as workerService from '../services/openstack.js'
import authenticate from '../plugins/authenticate.js'
import { validateQuery, providerIdQuerySchema } from '../utils/validation.js'

export async function volumeRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)

  server.get('/volumes', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getVolumes(providerId)
    return reply.send(data)
  })

  server.get('/volumes/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getVolumeById(providerId, id)
    return reply.send(data)
  })

  server.delete('/volumes/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.deleteVolume(providerId, id)
    return reply.send(data)
  })
}
