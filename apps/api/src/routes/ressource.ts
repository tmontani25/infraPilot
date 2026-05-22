import type { FastifyInstance } from 'fastify'
import * as workerService from '../services/worker.js'

export async function ressourceRoutes(server: FastifyInstance) {

  server.get('/networks', async (_req, reply) => {
    const data = await workerService.getNetworks()
    return reply.send(data)
  })

  server.get('/images', async (_req, reply) => {
    const data = await workerService.getImages()
    return reply.send(data)
  })

  server.get('/flavors', async (_req, reply) => {
    const data = await workerService.getFlavors()
    return reply.send(data)
  })

  server.get('/subnets', async (_req, reply) => {
    const data = await workerService.getSubnets()
    return reply.send(data)
  })

  server.get('/security-groups', async (_req, reply) => {
    const data = await workerService.getSecurityGroups()
    return reply.send(data)
  })

  server.get('/keypairs', async (_req, reply) => {
    const data = await workerService.getKeypairs()
    return reply.send(data)
  })
}
