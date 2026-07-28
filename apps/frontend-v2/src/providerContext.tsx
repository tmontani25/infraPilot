import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getClients } from './services/clients'
import { getCloudProviders } from './services/cloudProviders'
import { setActiveProviderId } from './lib/apiClient'
import type { Client, CloudProvider } from './types'
import { useAuth } from './authContext'

const STORAGE_KEY = 'infrapilot.activeProviderId'

export type ProviderWithClient = CloudProvider & { clientName: string }

type ProviderContextType = {
  loading: boolean
  clients: Client[]
  providers: ProviderWithClient[]
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
  const [providers, setProviders] = useState<ProviderWithClient[]>([])
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

      const perClient = await Promise.all(
        clientList.map(async (client) => {
          const providers = await getCloudProviders(client.id)
          return providers.map((p) => ({ ...p, clientName: client.name }))
        })
      )
      const allProviders = perClient.flat()
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
    <ProviderContext.Provider value={{ loading, clients, providers, activeProviderId, setActiveProvider, refresh }}>
      {children}
    </ProviderContext.Provider>
  )
}
