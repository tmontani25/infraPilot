import type { FastifyInstance } from 'fastify'
import * as playbookRunService from '../services/playbookRunService.js'
import authenticate from '../plugins/authenticate.js'
import { success } from '../utils/response.js'
import { validateQuery, providerIdQuerySchema } from '../utils/validation.js'

export async function playbookRunRoutes(server: FastifyInstance) {
    server.addHook('preHandler', authenticate)

    server.get('/playbooks', async (_req, _reply) => {
        const playbooks = await playbookRunService.listPlaybooks()
        return success({ playbooks })
    })

    server.get('/playbook-runs', async (_req, _reply) => {
        const runs = await playbookRunService.listRuns()
        return success({ runs })
    })

    server.get('/playbook-runs/:id', async (req, _reply) => {
        const { id } = req.params as { id: string }
        const run = await playbookRunService.getRun(Number(id))
        return success({ run })
    })

    server.post('/playbook-runs', async (req, reply) => {
        const { providerId } = validateQuery(providerIdQuerySchema, req.query)
        const { playbookId, name, vmIds, sshUser } = req.body as {
            playbookId: string
            name: string
            vmIds: string[]
            sshUser?: string
        }
        const run = await playbookRunService.createRun(providerId, playbookId, name, vmIds, sshUser || 'ubuntu')
        reply.status(201)
        return success({ run })
    })
}
