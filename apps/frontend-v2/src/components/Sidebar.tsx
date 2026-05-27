import { IconLayoutDashboard, IconCloud, IconSettings } from '@tabler/icons-react'

type Tab = 'overview' | 'resources' | 'network' | 'datastore'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <nav className="sidebar">
      <div
        className={`sb-item ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => onTabChange('overview')}
      >
        <IconLayoutDashboard size={14} />
        <div className="sb-info">
          <div className="sb-name">Overview</div>
        </div>
      </div>

      <div className="sb-divider" />

      <div className="sb-section-hd">OpenStack Infomaniak</div>

      <div
        className={`sb-item ${activeTab === 'resources' ? 'active' : ''}`}
        onClick={() => onTabChange('resources')}
      >
        <IconCloud size={14} color="#60a5fa" />
        <div className="sb-info">
          <div className="sb-name">Instances</div>
          <div className="sb-ip">VMs</div>
        </div>
      </div>

      <div
        className={`sb-item ${activeTab === 'network' ? 'active' : ''}`}
        onClick={() => onTabChange('network')}
      >
        <IconCloud size={14} color="#a78bfa" />
        <div className="sb-info">
          <div className="sb-name">Network</div>
          <div className="sb-ip">Réseaux · Subnets · SG</div>
        </div>
      </div>

      <div
        className={`sb-item ${activeTab === 'datastore' ? 'active' : ''}`}
        onClick={() => onTabChange('datastore')}
      >
        <IconCloud size={14} color="#4ade80" />
        <div className="sb-info">
          <div className="sb-name">Datastore</div>
          <div className="sb-ip">Volumes</div>
        </div>
      </div>

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
