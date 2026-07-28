import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconFolder } from '@tabler/icons-react'
import { getProject } from '../services/projects'
import { getCloudProviders } from '../services/cloudProviders'
import { getTemplates, getDeployments } from '../services/deployments'
import { useProviders } from '../providerContext'
import { getErrorMessage } from '../lib/errors'
import Dashboard from './Dashboard'
import NetworkPage from './Network'
import Datastore from './Datastore'
import NewDeploymentForm from '../components/deployments/NewDeploymentForm'
import DeploymentHistoryTable from '../components/deployments/DeploymentHistoryTable'
import type { Project, CloudProvider, DeploymentTemplate, Deployment } from '../types'

type Tab = 'vue' | 'reseau' | 'deploiement' | 'logs'
const TABS: { id: Tab; label: string }[] = [
  { id: 'vue',         label: 'Vue' },
  { id: 'reseau',      label: 'Réseau' },
  { id: 'deploiement', label: 'Déploiement' },
  { id: 'logs',        label: 'Logs' },
]

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { activeProviderId, setActiveProvider } = useProviders()

  const [project, setProject] = useState<Project | null>(null)
  const [providers, setProviders] = useState<CloudProvider[]>([])
  const [templates, setTemplates] = useState<DeploymentTemplate[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [tab, setTab] = useState<Tab>('vue')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    if (!projectId) return
    try {
      const [projectData, providerData] = await Promise.all([
        getProject(Number(projectId)),
        getCloudProviders(Number(projectId)),
      ])
      setProject(projectData)
      setProviders(providerData)
      setError(null)
    } catch (e: unknown) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchProject() }, [fetchProject])

  // les onglets Vue/Réseau réutilisent Dashboard/Network qui s'appuient sur le compte
  // cloud "actif" global — on active automatiquement celui de ce projet en y entrant
  useEffect(() => {
    if (providers.length > 0 && !providers.some(p => p.id === activeProviderId)) {
      setActiveProvider(providers[0].id)
    }
  }, [providers, activeProviderId, setActiveProvider])

  const providerIds = providers.map(p => p.id)

  const loadDeployments = useCallback(async () => {
    const [t, d] = await Promise.all([getTemplates(), getDeployments()])
    setTemplates(t)
    setDeployments(d.filter(dep => providerIds.includes(dep.providerId)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers])

  useEffect(() => {
    if (providers.length > 0) loadDeployments()
  }, [providers, loadDeployments])

  if (loading) return <div className="state-empty">Chargement…</div>
  if (error)   return <div className="state-error">{error}</div>
  if (!project) return null

  const contextReady = providers.some(p => p.id === activeProviderId)

  return (
    <>
      <div className="vm-detail-header">
        <button className="vm-detail-back" onClick={() => navigate(-1)}>
          <IconArrowLeft size={13} />
          Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div className="vm-detail-icon"><IconFolder size={16} /></div>
          <div className="vm-detail-name">{project.name}</div>
        </div>
      </div>

      {providers.length === 0 ? (
        <div className="state-empty">
          Aucun compte cloud pour ce projet — ajoute-en un dans Réglages
        </div>
      ) : !contextReady ? (
        <div className="state-empty">Chargement…</div>
      ) : (
        <>
          <div className="tab-bar" style={{ background: 'transparent', border: 'none', padding: 0, height: 'auto' }}>
            {TABS.map(t => (
              <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </div>
            ))}
          </div>

          {tab === 'vue' && (
            <>
              <Dashboard embedded key={`dash-${activeProviderId}`} />
              <Datastore key={`vol-${activeProviderId}`} />
            </>
          )}

          {tab === 'reseau' && <NetworkPage key={`net-${activeProviderId}`} />}

          {tab === 'deploiement' && (
            <NewDeploymentForm templates={templates} onCreated={loadDeployments} />
          )}

          {tab === 'logs' && (
            <>
              <DeploymentHistoryTable
                deployments={deployments}
                onChanged={loadDeployments}
                title="Historique des déploiements"
                emptyMessage="Aucun déploiement pour ce projet"
              />
              <div className="card">
                <div className="card-title">Sauvegardes</div>
                <div className="state-empty">À venir</div>
              </div>
              <div className="card">
                <div className="card-title">Incidents</div>
                <div className="state-empty">À venir</div>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}
