import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconFolder, IconServer, IconChevronRight } from '@tabler/icons-react'
import { getProject } from '../services/projects'
import { getCloudProviders } from '../services/cloudProviders'
import { useProviders } from '../providerContext'
import { getErrorMessage } from '../lib/errors'
import OpenstackTenantLabel from '../components/ui/OpenstackTenantLabel'
import type { Project, CloudProvider } from '../types'

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { setActiveProvider } = useProviders()

  const [project, setProject] = useState<Project | null>(null)
  const [providers, setProviders] = useState<CloudProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
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

  useEffect(() => { fetchAll() }, [fetchAll])

  function handleSelect(providerId: number) {
    setActiveProvider(providerId)
    navigate('/')
  }

  if (loading) return <div className="state-empty">Chargement…</div>
  if (error)   return <div className="state-error">{error}</div>
  if (!project) return null

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

      <div className="card">
        <div className="card-title">Comptes cloud</div>
        {providers.length === 0 ? (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>
            Aucun compte cloud pour ce projet — ajoute-en un dans Réglages
          </div>
        ) : (
          providers.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '10px 6px', borderTop: '1px solid var(--border)',
              }}
              onClick={() => handleSelect(p.id)}
            >
              <IconServer size={14} color="#60a5fa" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                  <span>{p.type}</span>
                  <OpenstackTenantLabel providerId={p.id} type={p.type} />
                </div>
              </div>
              <IconChevronRight size={14} color="#555" />
            </div>
          ))
        )}
      </div>
    </>
  )
}
