import { useNavigate, useLocation } from 'react-router-dom'
import { IconLayoutDashboard, IconServer, IconTopologyStar, IconDatabase } from '@tabler/icons-react'

const TABS = [
  { path: '/',          label: 'Overview',   icon: <IconLayoutDashboard size={13} /> },
  { path: '/resources', label: 'Instances',  icon: <IconServer size={13} /> },
  { path: '/network',   label: 'Network',    icon: <IconTopologyStar size={13} /> },
  { path: '/datastore', label: 'Datastore',  icon: <IconDatabase size={13} /> },
]

export default function TabBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="tab-bar">
      {TABS.map(t => (
        <div
          key={t.path}
          className={`tab ${pathname === t.path ? 'active' : ''}`}
          onClick={() => navigate(t.path)}
        >
          {t.icon} {t.label}
        </div>
      ))}
    </div>
  )
}
