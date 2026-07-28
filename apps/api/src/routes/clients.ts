import type { FastifyInstance } from 'fastify'
import * as clientService from '../services/clientService.js'
import authenticate from '../plugins/authenticate.js'
import { success } from '../utils/response.js'

export async function clientRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authenticate)

  server.get('/clients', async (_req, _reply) => {
    const clients = await clientService.getAllClients()
    return success({ clients })
  })

  server.post('/clients', async (req, reply) => {
    const { name } = req.body as { name: string }
    const client = await clientService.createClient(name)
    reply.status(201)
    return success({ client })
  })

  server.delete('/clients/:id', async (req, _reply) => {
    const { id } = req.params as { id: string }
    await clientService.deleteClient(Number(id))
    return success({ message: 'Client supprimé' })
  })
}
