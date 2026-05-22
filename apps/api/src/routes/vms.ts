import type { FastifyInstance } from 'fastify'
import * as workerService from '../services/worker.js'

export async function vmRoutes(server: FastifyInstance) {

  server.get('/vms', async (_req, reply) => {
    const data = await workerService.getVms()
    return reply.send(data)
  })

  server.get('/vms/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = await workerService.getVmById(id)
    return reply.send(data)
  })

  server.post('/vms', async (req, reply) => {
    const body = req.body as { name: string; image_id: string; flavor_id: string; network_id: string }
    const data = await workerService.createVm(body)
    return reply.send(data)
  })

  server.delete('/vms/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = await workerService.deleteVm(id)
    return reply.send(data)
  })

  server.post('/vms/:id/start', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = await workerService.startVm(id)
    return reply.send(data)
  })

  server.post('/vms/:id/stop', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = await workerService.stopVm(id)
    return reply.send(data)
  })

  server.post('/vms/:id/reboot', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = await workerService.rebootVm(id)
    return reply.send(data)
  })

  server.get('/vms/:id/volumes', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = await workerService.getVmVolumes(id)
    return reply.send(data)
  })
}
