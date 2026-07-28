import type { FastifyInstance } from 'fastify'
import * as cloudProviderService from '../services/cloudProviderService.js'
import authenticate from '../plugins/authenticate.js'
import { success } from '../utils/response.js'

export async function cloudProviderRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)

  server.get('/clients/:clientId/cloud-providers', async (req, _reply) => {
    const { clientId } = req.params as { clientId: string }
    const providers = await cloudProviderService.listCloudProviders(Number(clientId))
    return success({ providers })
  })

  server.post('/clients/:clientId/cloud-providers', async (req, reply) => {
    const { clientId } = req.params as { clientId: string }
    const { type, name, credentials } = req.body as { type: string; name: string; credentials: Record<string, unknown> }
    const provider = await cloudProviderService.createCloudProvider(Number(clientId), type, name, credentials)
    reply.status(201)
    return success({ provider })
  })

  server.delete('/cloud-providers/:id', async (req, _reply) => {
    const { id } = req.params as { id: string }
    await cloudProviderService.deleteCloudProvider(Number(id))
    return success({ message: 'Cloud provider supprimé' })
  })
}
