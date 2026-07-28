import { useNavigate, useLocation } from 'react-router-dom'
import { IconLayoutDashboard, IconCloud, IconRocket, IconBuilding, IconLogout, IconSettings } from '@tabler/icons-react'
import { useAuth } from '../authContext'

const NAV = [
  { path: '/clients',     label: 'Clients',      icon: <IconBuilding size={14} color="#f59e0b" />, sub: 'Projets par client', match: ['/clients', '/projects'] },
  { path: '/',            label: 'Overview',     icon: <IconLayoutDashboard size={14} />, sub: null },
  { path: '/resources',   label: 'Instances',    icon: <IconCloud size={14} color="#60a5fa" />, sub: 'VMs', section: 'OpenStack Infomaniak' },
  { path: '/network',     label: 'Network',      icon: <IconCloud size={14} color="#a78bfa" />, sub: 'Réseaux · Subnets · SG' },
  { path: '/datastore',   label: 'Datastore',    icon: <IconCloud size={14} color="#4ade80" />, sub: 'Volumes' },
  { path: '/deployments', label: 'Déploiements', icon: <IconRocket size={14} color="#e8690a" />, sub: 'OpenTofu', section: 'Infrastructure as Code' },
]

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrateur',
  member: 'Membre',
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const initials = user?.username.slice(0, 2).toUpperCase() ?? '??'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sidebar">
      {NAV.map((item) => (
        <div key={item.path} style={{ display: 'contents' }}>
          {item.section && (
            <>
              <div className="sb-divider" />
              <div className="sb-section-hd">{item.section}</div>
            </>
          )}
          <div
            className={`sb-item ${(item.match ? item.match.some((m) => pathname.startsWith(m)) : pathname === item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <div className="sb-info">
              <div className="sb-name">{item.label}</div>
              {item.sub && <div className="sb-ip">{item.sub}</div>}
            </div>
          </div>
        </div>
      ))}

      <div className="sb-bottom">
        <div className="sb-bot-avatar">{initials}</div>
        <div>
          <div className="sb-bot-name">{user?.username}</div>
          <div className="sb-bot-role">{ROLE_LABEL[user?.role ?? ''] ?? user?.role}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <IconSettings size={14} color="#444" style={{ cursor: 'pointer' }} onClick={() => navigate('/settings')} />
          <IconLogout size={14} color="#444" style={{ cursor: 'pointer' }} onClick={handleLogout} />
        </div>
      </div>
    </nav>
  )
}
