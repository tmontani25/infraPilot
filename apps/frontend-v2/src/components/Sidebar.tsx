import { useNavigate, useLocation } from 'react-router-dom'
import {
  IconLayoutDashboard, IconBuilding, IconServer2, IconCloud,
  IconRocket, IconChartBar, IconSettings, IconLogout,
} from '@tabler/icons-react'
import { useAuth } from '../authContext'

const NAV = [
  { path: '/',            label: 'Dashboard',    icon: <IconLayoutDashboard size={14} /> },
  { path: '/clients',     label: 'Clients',      icon: <IconBuilding size={14} color="#f59e0b" />, match: ['/clients'] },
  { path: '/servers',     label: 'Serveurs',      icon: <IconServer2 size={14} color="#4ade80" /> },
  { path: '/cloud',       label: 'Public Cloud', icon: <IconCloud size={14} color="#60a5fa" />, match: ['/cloud', '/projects'] },
  { path: '/deployments', label: 'Déploiements', icon: <IconRocket size={14} color="#e8690a" /> },
  { path: '/monitoring',  label: 'Monitoring',   icon: <IconChartBar size={14} color="#a78bfa" /> },
  { path: '/settings',    label: 'Paramètres',   icon: <IconSettings size={14} color="#888" /> },
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
        <div
          key={item.path}
          className={`sb-item ${(item.match ? item.match.some((m) => pathname.startsWith(m)) : pathname === item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          <div className="sb-info">
            <div className="sb-name">{item.label}</div>
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
          <IconLogout size={14} color="#444" style={{ cursor: 'pointer' }} onClick={handleLogout} />
        </div>
      </div>
    </nav>
  )
}
