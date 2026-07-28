import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getClients } from './services/clients'
import { getProjects, getIndependentProjects } from './services/projects'
import { getCloudProviders } from './services/cloudProviders'
import { setActiveProviderId } from './lib/apiClient'
import type { Client, Project, CloudProvider } from './types'
import { useAuth } from './authContext'

const STORAGE_KEY = 'infrapilot.activeProviderId'

// Un compte cloud (CloudProvider) appartient à un Projet, qui appartient (ou pas) à un Client :
// Client (ex: "Étude d'avocats X") -> Projet (ex: "Infra prod") -> Compte cloud (OpenStack/Proxmox/...).
// Un projet sans client (clientId null) est un "projet indépendant" (ex: sandbox interne).
export type ProviderWithContext = CloudProvider & { clientId: number | null; clientName: string; projectName: string }

type ProviderContextType = {
  loading: boolean
  clients: Client[]
  projectsByClient: Record<number, Project[]>
  independentProjects: Project[]
  providers: ProviderWithContext[]
  activeProviderId: number | null
  setActiveProvider: (id: number | null) => void
  refresh: () => Promise<void>
}

const ProviderContext = createContext<ProviderContextType | null>(null)

export function useProviders() {
  const ctx = useContext(ProviderContext)
  if (!ctx) throw new Error('useProviders must be used inside ProviderProvider')
  return ctx
}

export function ProviderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [projectsByClient, setProjectsByClient] = useState<Record<number, Project[]>>({})
  const [independentProjects, setIndependentProjects] = useState<Project[]>([])
  const [providers, setProviders] = useState<ProviderWithContext[]>([])
  const [activeProviderId, setActiveProviderIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? Number(stored) : null
  })

  function setActiveProvider(id: number | null) {
    setActiveProviderIdState(id)
    setActiveProviderId(id)
    if (id != null) localStorage.setItem(STORAGE_KEY, String(id))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const clientList = await getClients()
      setClients(clientList)

      const projectsPerClient = await Promise.all(clientList.map((c) => getProjects(c.id)))
      const projectsByClientMap: Record<number, Project[]> = {}
      clientList.forEach((c, i) => { projectsByClientMap[c.id] = projectsPerClient[i] })
      setProjectsByClient(projectsByClientMap)

      const independentList = await getIndependentProjects()
      setIndependentProjects(independentList)

      const allProjectEntries = [
        ...clientList.flatMap((client) =>
          (projectsByClientMap[client.id] ?? []).map((project) => ({ project, client }))
        ),
        ...independentList.map((project) => ({ project, client: null as Client | null })),
      ]
      const providersPerProject = await Promise.all(
        allProjectEntries.map(({ project }) => getCloudProviders(project.id))
      )
      const allProviders: ProviderWithContext[] = allProjectEntries.flatMap(({ project, client }, i) =>
        providersPerProject[i].map((p) => ({
          ...p,
          clientId: client?.id ?? null,
          clientName: client?.name ?? '',
          projectName: project.name,
        }))
      )
      setProviders(allProviders)

      // si le provider actif n'existe plus (supprimé) ou qu'aucun n'est choisi,
      // on retombe automatiquement sur le premier disponible
      setActiveProviderIdState((current) => {
        const stillValid = current != null && allProviders.some((p) => p.id === current)
        const next = stillValid ? current : (allProviders[0]?.id ?? null)
        setActiveProviderId(next)
        if (next != null) localStorage.setItem(STORAGE_KEY, String(next))
        return next
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    setActiveProviderId(activeProviderId)
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <ProviderContext.Provider value={{ loading, clients, projectsByClient, independentProjects, providers, activeProviderId, setActiveProvider, refresh }}>
      {children}
    </ProviderContext.Provider>
  )
}
