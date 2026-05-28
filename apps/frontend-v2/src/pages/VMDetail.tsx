import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  IconArrowLeft, IconPower, IconPlayerStop,
  IconRefresh, IconTrash, IconServer, IconDatabase,
} from '@tabler/icons-react'
import { getVm, getVmVolumes, startVm, stopVm, rebootVm, deleteVm } from '../services/vms'
import StatusPill from '../components/ui/StatusPill'
import type { VMDetail as VMDetailType, Volume } from '../types'

export default function VMDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [vm, setVm] = useState<VMDetailType | null>(null)
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!id) return
    try {
      const [vmData, volData] = await Promise.all([getVm(id), getVmVolumes(id)])
      setVm(vmData)
      setVolumes(volData)
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur API')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleAction(name: string, fn: () => Promise<void>) {
    setAction(name)
    try {
      await fn()
      setTimeout(fetchAll, 1500)
    } finally {
      setAction(null)
    }
  }

  async function handleDelete() {
    if (!id || !vm) return
    if (!confirm(`Supprimer ${vm.name} ?`)) return
    setAction('delete')
    try {
      await deleteVm(id)
      navigate('/resources')
    } finally {
      setAction(null)
    }
  }

  if (loading) return <div className="state-empty">Chargement…</div>
  if (error)   return <div className="state-error">{error}</div>
  if (!vm)     return null

  const isActive  = vm.status === 'ACTIVE'
  const isStopped = vm.status === 'SHUTOFF'
  const busy      = action !== null

  const allAddresses = Object.entries(vm.addresses).flatMap(([net, addrs]) =>
    addrs.map(a => ({ network: net, addr: a.addr, type: a['OS-EXT-IPS:type'], version: a.version }))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div className="vm-detail-header">
        <button className="vm-detail-back" onClick={() => navigate('/resources')}>
          <IconArrowLeft size={13} />
          Instances
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div className="vm-detail-icon"><IconServer size={16} /></div>
          <div>
            <div className="vm-detail-name">{vm.name}</div>
            <div className="vm-detail-id">{vm.id}</div>
          </div>
          <StatusPill status={vm.status} />
        </div>

        <div className="vm-detail-actions">
          <button
            className={`vm-act-btn${action === 'start' ? ' loading' : ''}`}
            title="Start" disabled={isActive || busy}
            onClick={() => handleAction('start', () => startVm(vm.id))}
          ><IconPower size={13} /></button>
          <button
            className={`vm-act-btn${action === 'stop' ? ' loading' : ''}`}
            title="Stop" disabled={isStopped || busy}
            onClick={() => handleAction('stop', () => stopVm(vm.id))}
          ><IconPlayerStop size={13} /></button>
          <button
            className={`vm-act-btn${action === 'reboot' ? ' loading' : ''}`}
            title="Reboot" disabled={!isActive || busy}
            onClick={() => handleAction('reboot', () => rebootVm(vm.id))}
          ><IconRefresh size={13} /></button>
          <button
            className={`vm-act-btn${action === 'delete' ? ' loading' : ''}`}
            title="Delete" disabled={busy}
            style={{ color: '#ef4444' }}
            onClick={handleDelete}
          ><IconTrash size={13} /></button>
        </div>
      </div>

      {/* Info grid */}
      <div className="vm-detail-grid">
        <InfoBox label="Statut"      value={<StatusPill status={vm.status} />} />
        <InfoBox label="Flavor ID"   value={vm.flavor} mono />
        <InfoBox label="Image ID"    value={vm.image ?? '—'} mono />
        <InfoBox label="Clé SSH"     value={vm.key_name ?? '—'} />
        <InfoBox label="Créé le"     value={new Date(vm.created_at).toLocaleString('fr-FR')} />
        <InfoBox label="ID"          value={vm.id} mono />
      </div>

      {/* Addresses */}
      {allAddresses.length > 0 && (
        <div className="card">
          <div className="card-title">Adresses réseau</div>
          <table className="tr-table">
            <thead>
              <tr>
                <th>Réseau</th>
                <th>Adresse IP</th>
                <th>Type</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
              {allAddresses.map((a, i) => (
                <tr key={i}>
                  <td>{a.network}</td>
                  <td style={{ fontFamily: 'monospace' }}>{a.addr}</td>
                  <td><span className="vm-addr-type">{a.type}</span></td>
                  <td>IPv{a.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Volumes */}
      <div className="card">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconDatabase size={12} color="#888" />
          Volumes attachés
          <span className="vm-vol-count">{volumes.length}</span>
        </div>
        {volumes.length === 0 ? (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '8px 0' }}>Aucun volume attaché</div>
        ) : (
          <table className="tr-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>ID</th>
                <th>Taille</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {volumes.map(v => (
                <tr key={v.id}>
                  <td>{v.name || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 9 }}>{v.id.slice(0, 12)}…</td>
                  <td>{v.size} GB</td>
                  <td><span className={`status-pill ${v.status === 'in-use' ? 'sp-active' : 'sp-shutoff'}`}>{v.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function InfoBox({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="vm-info-box">
      <div className="vm-info-label">{label}</div>
      <div className={`vm-info-val${mono ? ' mono' : ''}`}>{value}</div>
    </div>
  )
}
