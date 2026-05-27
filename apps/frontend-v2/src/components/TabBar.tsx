import { IconLayoutDashboard, IconServer, IconTopologyStar, IconDatabase } from '@tabler/icons-react'

type Tab = 'overview' | 'resources' | 'network' | 'datastore'

interface TabBarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',   label: 'Overview',   icon: <IconLayoutDashboard size={13} /> },
  { id: 'resources',  label: 'Instances',  icon: <IconServer size={13} /> },
  { id: 'network',    label: 'Network',    icon: <IconTopologyStar size={13} /> },
  { id: 'datastore',  label: 'Datastore',  icon: <IconDatabase size={13} /> },
]

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="tab-bar">
      {TABS.map(t => (
        <div
          key={t.id}
          className={`tab ${activeTab === t.id ? 'active' : ''}`}
          onClick={() => onTabChange(t.id)}
        >
          {t.icon} {t.label}
        </div>
      ))}
    </div>
  )
}
