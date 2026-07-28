import type { FastifyInstance } from 'fastify'
import * as projectService from '../services/projectService.js'
import authenticate from '../plugins/authenticate.js'
import { success } from '../utils/response.js'

// Business "Projet" (regroupe des comptes cloud pour un client) — à ne pas confondre
// avec routes/project.ts qui expose le "project" (tenant) OpenStack d'un worker.
export async function clientProjectRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)

  server.get('/clients/:clientId/projects', async (req, _reply) => {
    const { clientId } = req.params as { clientId: string }
    const projects = await projectService.listProjects(Number(clientId))
    return success({ projects })
  })

  server.post('/clients/:clientId/projects', async (req, reply) => {
    const { clientId } = req.params as { clientId: string }
    const { name } = req.body as { name: string }
    const project = await projectService.createProject(Number(clientId), name)
    reply.status(201)
    return success({ project })
  })

  server.delete('/projects/:id', async (req, _reply) => {
    const { id } = req.params as { id: string }
    await projectService.deleteProject(Number(id))
    return success({ message: 'Projet supprimé' })
  })
}
