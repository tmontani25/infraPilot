import { useParams, useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconBuilding, IconFolder, IconChevronRight } from '@tabler/icons-react'
import { useProviders } from '../providerContext'

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { clients, projectsByClient, loading } = useProviders()

  if (loading) return <div className="state-empty">Chargement…</div>

  const client = clients.find((c) => c.id === Number(clientId))
  if (!client) return <div className="state-error">Client introuvable</div>

  const projects = projectsByClient[client.id] ?? []

  return (
    <>
      <div className="vm-detail-header">
        <button className="vm-detail-back" onClick={() => navigate('/clients')}>
          <IconArrowLeft size={13} />
          Clients
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div className="vm-detail-icon"><IconBuilding size={16} /></div>
          <div>
            <div className="vm-detail-name">Projets de {client.name}</div>
            <div className="vm-detail-id">Tous les projets liés à ce client</div>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="state-empty">
          Aucun projet pour ce client — ajoute-en un dans Réglages
        </div>
      ) : (
        <div className="grid-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="vm-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="vm-card-hd">
                <div className="vm-detail-icon" style={{ width: 30, height: 30 }}><IconFolder size={16} /></div>
                <div className="vm-name" style={{ flex: 1 }}>{project.name}</div>
                <IconChevronRight size={14} color="#555" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
