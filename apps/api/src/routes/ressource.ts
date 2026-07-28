import type { FastifyInstance } from 'fastify'
import * as workerService from '../services/openstack.js'
import authenticate from '../plugins/authenticate.js'
import { validateQuery, providerIdQuerySchema } from '../utils/validation.js'

export async function ressourceRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)

  server.get('/networks', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getNetworks(providerId)
    return reply.send(data)
  })

  server.get('/images', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getImages(providerId)
    return reply.send(data)
  })

  server.get('/flavors', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getFlavors(providerId)
    return reply.send(data)
  })

  server.get('/subnets', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getSubnets(providerId)
    return reply.send(data)
  })

  server.get('/security-groups', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getSecurityGroups(providerId)
    return reply.send(data)
  })

  server.get('/keypairs', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const data = await workerService.getKeypairs(providerId)
    return reply.send(data)
  })
}
