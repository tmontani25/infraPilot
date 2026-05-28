import { useNavigate, useLocation } from 'react-router-dom'
import { IconLayoutDashboard, IconCloud, IconSettings } from '@tabler/icons-react'

const NAV = [
  { path: '/',           label: 'Overview',   icon: <IconLayoutDashboard size={14} />, sub: null },
  { path: '/resources',  label: 'Instances',  icon: <IconCloud size={14} color="#60a5fa" />, sub: 'VMs' },
  { path: '/network',    label: 'Network',    icon: <IconCloud size={14} color="#a78bfa" />, sub: 'Réseaux · Subnets · SG' },
  { path: '/datastore',  label: 'Datastore',  icon: <IconCloud size={14} color="#4ade80" />, sub: 'Volumes' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="sidebar">
      {NAV.map((item, i) => (
        <>
          {i === 1 && (
            <>
              <div key="divider" className="sb-divider" />
              <div key="section" className="sb-section-hd">OpenStack Infomaniak</div>
            </>
          )}
          <div
            key={item.path}
            className={`sb-item ${pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <div className="sb-info">
              <div className="sb-name">{item.label}</div>
              {item.sub && <div className="sb-ip">{item.sub}</div>}
            </div>
          </div>
        </>
      ))}

      <div className="sb-bottom">
        <div className="sb-bot-avatar">AL</div>
        <div>
          <div className="sb-bot-name">Admin</div>
          <div className="sb-bot-role">Administrateur</div>
        </div>
        <IconSettings size={14} color="#444" style={{ marginLeft: 'auto', cursor: 'pointer' }} />
      </div>
    </nav>
  )
}
