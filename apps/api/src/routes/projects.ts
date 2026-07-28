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

  // Projets non rattachés à un client (ex: sandbox interne)
  server.get('/projects/independent', async (_req, _reply) => {
    const projects = await projectService.listIndependentProjects()
    return success({ projects })
  })

  server.post('/projects/independent', async (req, reply) => {
    const { name } = req.body as { name: string }
    const project = await projectService.createIndependentProject(name)
    reply.status(201)
    return success({ project })
  })

  server.get('/projects/:id', async (req, _reply) => {
    const { id } = req.params as { id: string }
    const project = await projectService.getProjectById(Number(id))
    return success({ project })
  })

  // Déplace un projet vers un autre client, ou le rend indépendant (clientId: null)
  server.patch('/projects/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { clientId } = req.body as { clientId: number | null }
    const project = await projectService.moveProject(Number(id), clientId)
    reply.status(200)
    return success({ project })
  })

  server.delete('/projects/:id', async (req, _reply) => {
    const { id } = req.params as { id: string }
    await projectService.deleteProject(Number(id))
    return success({ message: 'Projet supprimé' })
  })
}
