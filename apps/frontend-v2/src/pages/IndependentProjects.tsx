import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconFolders, IconFolder, IconChevronRight } from '@tabler/icons-react'
import { useProviders } from '../providerContext'

export default function IndependentProjects() {
  const navigate = useNavigate()
  const { independentProjects, loading } = useProviders()

  if (loading) return <div className="state-empty">Chargement…</div>

  return (
    <>
      <div className="vm-detail-header">
        <button className="vm-detail-back" onClick={() => navigate('/clients')}>
          <IconArrowLeft size={13} />
          Clients
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div className="vm-detail-icon"><IconFolders size={16} /></div>
          <div className="vm-detail-name">Projets indépendants</div>
        </div>
      </div>

      {independentProjects.length === 0 ? (
        <div className="state-empty">
          Aucun projet indépendant pour le moment — ajoute-en un dans Réglages
        </div>
      ) : (
        <div className="grid-3">
          {independentProjects.map((project) => (
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
