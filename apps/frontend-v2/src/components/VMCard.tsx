import { useState } from 'react'
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
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAction(action: string, fn: () => Promise<void>) {
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
    <div className={`vm-card${isError ? ' error' : ''}`}>
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
          onClick={() => handleAction('start', () => startVm(vm.id))}
        >
          <IconPower size={12} />
        </button>
        <button
          className={`vm-act-btn${loading === 'stop' ? ' loading' : ''}`}
          title="Stop"
          disabled={isStopped || loading !== null}
          onClick={() => handleAction('stop', () => stopVm(vm.id))}
        >
          <IconPlayerStop size={12} />
        </button>
        <button
          className={`vm-act-btn${loading === 'reboot' ? ' loading' : ''}`}
          title="Reboot"
          disabled={!isActive || loading !== null}
          onClick={() => handleAction('reboot', () => rebootVm(vm.id))}
        >
          <IconRefresh size={12} />
        </button>
        <button
          className={`vm-act-btn${loading === 'delete' ? ' loading' : ''}`}
          title="Delete"
          disabled={loading !== null}
          style={{ marginLeft: 'auto', color: '#ef4444' }}
          onClick={() => {
            if (confirm(`Supprimer ${vm.name} ?`)) handleAction('delete', () => deleteVm(vm.id))
          }}
        >
          <IconTrash size={12} />
        </button>
      </div>
    </div>
  )
}
