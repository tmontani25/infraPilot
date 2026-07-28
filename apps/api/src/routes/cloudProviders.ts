import type { FastifyInstance } from 'fastify'
import * as cloudProviderService from '../services/cloudProviderService.js'
import authenticate from '../plugins/authenticate.js'
import { success } from '../utils/response.js'

export async function cloudProviderRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)

  server.get('/projects/:projectId/cloud-providers', async (req, _reply) => {
    const { projectId } = req.params as { projectId: string }
    const providers = await cloudProviderService.listCloudProviders(Number(projectId))
    return success({ providers })
  })

  server.post('/projects/:projectId/cloud-providers', async (req, reply) => {
    const { projectId } = req.params as { projectId: string }
    const { type, name, credentials } = req.body as { type: string; name: string; credentials: Record<string, unknown> }
    const provider = await cloudProviderService.createCloudProvider(Number(projectId), type, name, credentials)
    reply.status(201)
    return success({ provider })
  })

  server.patch('/cloud-providers/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { name } = req.body as { name: string }
    const provider = await cloudProviderService.renameCloudProvider(Number(id), name)
    reply.status(200)
    return success({ provider })
  })

  server.delete('/cloud-providers/:id', async (req, _reply) => {
    const { id } = req.params as { id: string }
    await cloudProviderService.deleteCloudProvider(Number(id))
    return success({ message: 'Cloud provider supprimé' })
  })
}
