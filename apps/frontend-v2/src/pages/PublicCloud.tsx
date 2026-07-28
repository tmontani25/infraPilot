import { useNavigate } from 'react-router-dom'
import { IconCloud, IconFolder, IconChevronRight } from '@tabler/icons-react'
import { useProviders } from '../providerContext'

export default function PublicCloud() {
  const { clients, projectsByClient, independentProjects, loading } = useProviders()
  const navigate = useNavigate()

  if (loading) return <div className="state-empty">Chargement…</div>

  const projects = [
    ...clients.flatMap((client) =>
      (projectsByClient[client.id] ?? []).map((project) => ({ project, clientName: client.name }))
    ),
    ...independentProjects.map((project) => ({ project, clientName: null as string | null })),
  ]

  return (
    <>
      <div className="overview-header">
        <div className="overview-icon"><IconCloud size={20} /></div>
        <div>
          <div className="overview-title">Public Cloud</div>
          <div className="overview-sub">Tous les projets, tous clients confondus</div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="state-empty">
          Aucun projet pour le moment — ajoute-en un dans Réglages
        </div>
      ) : (
        <div className="grid-3">
          {projects.map(({ project, clientName }) => (
            <div
              key={project.id}
              className="vm-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="vm-card-hd">
                <div className="vm-detail-icon" style={{ width: 30, height: 30 }}><IconFolder size={16} /></div>
                <div style={{ flex: 1 }}>
                  <div className="vm-name">{project.name}</div>
                  <div className="vm-id">{clientName ?? 'Indépendant'}</div>
                </div>
                <IconChevronRight size={14} color="#555" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
