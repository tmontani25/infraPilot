import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPower, IconRefresh, IconPlayerStop, IconTrash } from '@tabler/icons-react'
import { startVm, stopVm, rebootVm, deleteVm } from '../services/vms'
import StatusPill from './ui/StatusPill'
import Tag from './ui/Tag'
import type { VM } from '../types'

interface VMCardProps {
  vm: VM
  onRefresh: () => void
}

export default function VMCard({ vm, onRefresh }: VMCardProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAction(e: React.MouseEvent, action: string, fn: () => Promise<void>) {
    e.stopPropagation()
    setLoading(action)
    try {
      await fn()
      setTimeout(onRefresh, 1500)
    } finally {
      setLoading(null)
    }
  }

  const isError = vm.status === 'ERROR'
  const isActive = vm.status === 'ACTIVE'
  const isStopped = vm.status === 'SHUTOFF'

  return (
    <div
      className={`vm-card${isError ? ' error' : ''}`}
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/resources/${vm.id}`)}
    >
      <div className="vm-card-hd">
        <div>
          <div className="vm-name">{vm.name}</div>
          <div className="vm-id">{vm.id.slice(0, 8)}…</div>
        </div>
      </div>

      <div className="vm-meta">
        <div className="vm-meta-row">
          <span className="vm-meta-key">Status</span>
          <StatusPill status={vm.status} />
        </div>
        <div className="tags">
          <Tag label="VM OpenStack" variant="os" />
        </div>
      </div>

      <div className="vm-actions">
        <button
          className={`vm-act-btn${loading === 'start' ? ' loading' : ''}`}
          title="Start"
          disabled={isActive || loading !== null}
          onClick={e => handleAction(e, 'start', () => startVm(vm.id))}
        >
          <IconPower size={12} />
        </button>
        <button
          className={`vm-act-btn${loading === 'stop' ? ' loading' : ''}`}
          title="Stop"
          disabled={isStopped || loading !== null}
          onClick={e => handleAction(e, 'stop', () => stopVm(vm.id))}
        >
          <IconPlayerStop size={12} />
        </button>
        <button
          className={`vm-act-btn${loading === 'reboot' ? ' loading' : ''}`}
          title="Reboot"
          disabled={!isActive || loading !== null}
          onClick={e => handleAction(e, 'reboot', () => rebootVm(vm.id))}
        >
          <IconRefresh size={12} />
        </button>
        <button
          className={`vm-act-btn${loading === 'delete' ? ' loading' : ''}`}
          title="Delete"
          disabled={loading !== null}
          style={{ marginLeft: 'auto', color: '#ef4444' }}
          onClick={e => {
            e.stopPropagation()
            if (confirm(`Supprimer ${vm.name} ?`)) handleAction(e, 'delete', () => deleteVm(vm.id))
          }}
        >
          <IconTrash size={12} />
        </button>
      </div>
    </div>
  )
}
