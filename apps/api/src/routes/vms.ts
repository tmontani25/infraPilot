import type { FastifyInstance } from 'fastify'
import * as workerService from '../services/openstack.js'
import authenticate from '../plugins/authenticate.js'
import { validateQuery, providerIdQuerySchema } from '../utils/validation.js'

export async function vmRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)

  server.get('/vms', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getVms(providerId)
    return reply.send(data)
  })

  server.get('/vms/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getVmById(providerId, id)
    return reply.send(data)
  })

  server.post('/vms', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const body = req.body as { name: string; image_id: string; flavor_id: string; network_id: string }
    const data = await workerService.createVm(providerId, body)
    return reply.send(data)
  })

  server.delete('/vms/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.deleteVm(providerId, id)
    return reply.send(data)
  })

  server.post('/vms/:id/start', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.startVm(providerId, id)
    return reply.send(data)
  })

  server.post('/vms/:id/stop', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.stopVm(providerId, id)
    return reply.send(data)
  })

  server.post('/vms/:id/reboot', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.rebootVm(providerId, id)
    return reply.send(data)
  })

  server.get('/vms/:id/volumes', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getVmVolumes(providerId, id)
    return reply.send(data)
  })
}
