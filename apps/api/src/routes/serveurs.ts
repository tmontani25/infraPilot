import type { FastifyInstance } from 'fastify'
import * as serveurService from '../services/serveurService.js'
import authenticate from '../plugins/authenticate.js'
import { success } from '../utils/response.js'

type ServeurBody = {
  clientId?: number | null
  name: string
  hebergement: string
  os: string
  distribution?: string | null
  deploymentType?: string | null
  cloudProviderId?: number | null
  cloudVmId?: string | null
  cpu?: number | null
  ram?: number | null
  disk?: number | null
  ip?: string | null
  ssh?: string | null
  rdp?: string | null
  vpn?: string | null
  sauvegardes?: string
}

export async function serveurRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)

  server.get('/serveurs', async (req, _reply) => {
    const { clientId } = req.query as { clientId?: string }
    const serveurs = await serveurService.listServeurs(clientId ? Number(clientId) : undefined)
    return success({ serveurs })
  })

  server.get('/serveurs/:id', async (req, _reply) => {
    const { id } = req.params as { id: string }
    const serveur = await serveurService.getServeurById(Number(id))
    return success({ serveur })
  })

  server.get('/serveurs/:id/live', async (req, _reply) => {
    const { id } = req.params as { id: string }
    const live = await serveurService.getLiveSpec(Number(id))
    return success({ live })
  })

  server.get('/serveurs/:id/events', async (req, _reply) => {
    const { id } = req.params as { id: string }
    const events = await serveurService.listEvents(Number(id))
    return success({ events })
  })

  server.post('/serveurs/:id/events', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { type, message } = req.body as { type: 'note' | 'incident'; message: string }
    const event = type === 'incident'
      ? await serveurService.addIncident(Number(id), message)
      : await serveurService.addNote(Number(id), message)
    reply.status(201)
    return success({ event })
  })

  server.post('/serveurs/:id/actions/:action', async (req, _reply) => {
    const { id, action } = req.params as { id: string; action: string }
    const serveur = await serveurService.performAction(Number(id), action)
    return success({ serveur })
  })

  server.post('/serveurs', async (req, reply) => {
    const serveur = await serveurService.createServeur(req.body as ServeurBody)
    reply.status(201)
    return success({ serveur })
  })

  server.patch('/serveurs/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const serveur = await serveurService.updateServeur(Number(id), req.body as Partial<ServeurBody>)
    reply.status(200)
    return success({ serveur })
  })

  server.delete('/serveurs/:id', async (req, _reply) => {
    const { id } = req.params as { id: string }
    await serveurService.deleteServeur(Number(id))
    return success({ message: 'Serveur supprimé' })
  })
}
