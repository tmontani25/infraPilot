import { useNavigate } from 'react-router-dom'
import { IconBuilding, IconFolders, IconChevronRight } from '@tabler/icons-react'
import { useProviders } from '../providerContext'

export default function Clients() {
  const { clients, projectsByClient, independentProjects, loading } = useProviders()
  const navigate = useNavigate()

  if (loading) return <div className="state-empty">Chargement…</div>

  return (
    <>
      <div className="overview-header">
        <div className="overview-icon"><IconBuilding size={20} /></div>
        <div>
          <div className="overview-title">Clients</div>
          <div className="overview-sub">Parcourir les clients et leurs projets</div>
        </div>
      </div>

      {clients.length === 0 && independentProjects.length === 0 ? (
        <div className="state-empty">
          Aucun client pour le moment — ajoute-en un dans Réglages
        </div>
      ) : (
        <div className="grid-3">
          {clients.map((client) => (
            <NavCard
              key={client.id}
              icon={<IconBuilding size={16} />}
              title={client.name}
              sub={`${(projectsByClient[client.id] ?? []).length} projet(s)`}
              onClick={() => navigate(`/clients/${client.id}`)}
            />
          ))}

          <NavCard
            icon={<IconFolders size={16} />}
            title="Projets indépendants"
            sub={`${independentProjects.length} projet(s)`}
            onClick={() => navigate('/projects/independent')}
            dashed
          />
        </div>
      )}
    </>
  )
}

function NavCard({
  icon,
  title,
  sub,
  onClick,
  dashed,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  onClick: () => void
  dashed?: boolean
}) {
  return (
    <div
      className="vm-card"
      style={{ cursor: 'pointer', ...(dashed ? { borderStyle: 'dashed' } : {}) }}
      onClick={onClick}
    >
      <div className="vm-card-hd">
        <div className="vm-detail-icon" style={{ width: 30, height: 30 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div className="vm-name">{title}</div>
          <div className="vm-id">{sub}</div>
        </div>
        <IconChevronRight size={14} color="#555" />
      </div>
    </div>
  )
}
