import type { FastifyInstance } from 'fastify'
import * as deploymentService from '../services/deploymentService.js'
import authenticate from '../plugins/authenticate.js'
import { success } from '../utils/response.js'
import { validateQuery, providerIdQuerySchema } from '../utils/validation.js'

export async function deploymentRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)

  server.get('/templates', async (_req, _reply) => {
    const templates = await deploymentService.listTemplates()
    return success({ templates })
  })

  server.get('/deployments', async (_req, _reply) => {
    const deployments = await deploymentService.listDeployments()
    return success({ deployments })
  })

  server.get('/deployments/:id', async (req, _reply) => {
    const { id } = req.params as { id: string }
    const deployment = await deploymentService.getDeployment(Number(id))
    return success({ deployment })
  })

  server.post('/deployments', async (req, reply) => {
    const { providerId } = validateQuery(providerIdQuerySchema, req.query)
    const { templateId, name, variables } = req.body as {
      templateId: string
      name: string
      variables: Record<string, unknown>
    }
    const deployment = await deploymentService.createDeployment(providerId, templateId, name, variables)
    reply.status(201)
    return success({ deployment })
  })

  server.post('/deployments/:id/apply', async (req, _reply) => {
    const { id } = req.params as { id: string }
    const deployment = await deploymentService.applyDeployment(Number(id))
    return success({ deployment })
  })

  server.post('/deployments/:id/destroy', async (req, _reply) => {
    const { id } = req.params as { id: string }
    const deployment = await deploymentService.destroyDeployment(Number(id))
    return success({ deployment })
  })
}
