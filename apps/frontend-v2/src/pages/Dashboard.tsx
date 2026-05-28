import { useState, useEffect, useCallback } from 'react'
import { IconServer, IconCircleCheck, IconPlayerStop, IconAlertCircle, IconRefresh } from '@tabler/icons-react'
import { getVms } from '../services/vms'
import { getProject } from '../services/health'
import VMCard from '../components/VMCard'
import RingGauge from '../components/ui/RingGauge'
import type { VM } from '../types'

export default function Dashboard() {
  const [vms, setVms] = useState<VM[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)

  useEffect(() => {
    getProject().then(p => setProjectName(p.project_name)).catch(() => {})
  }, [])

  const fetchVms = useCallback(async () => {
    try {
      const data = await getVms()
      setVms(data)
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de connexion à l'API")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVms()
    const interval = setInterval(fetchVms, 30000)
    return () => clearInterval(interval)
  }, [fetchVms])

  const active   = vms.filter(v => v.status === 'ACTIVE').length
  const stopped  = vms.filter(v => v.status === 'SHUTOFF').length
  const errors   = vms.filter(v => v.status === 'ERROR').length
  const activePct = vms.length ? Math.round(active / vms.length * 100) : 0

  if (loading) return <div className="state-empty">Chargement des instances…</div>

  return (
    <>
      <div className="overview-header">
        <div className="overview-icon"><IconServer size={20} /></div>
        <div>
          <div className="overview-title">{projectName ?? 'OpenStack Infomaniak'}</div>
          <div className="overview-sub">Gestion des instances du projet</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {error
            ? <span className="pill pill-error">API indisponible</span>
            : <span className="pill pill-live">Live</span>}
          <button className="vm-act-btn" onClick={fetchVms} title="Rafraîchir" style={{ width: 28, height: 28 }}>
            <IconRefresh size={13} />
          </button>
        </div>
      </div>

      {error && <div className="state-error">{error}</div>}

      <div className="stats-row">
        <div className="stat-box">
          <IconServer size={18} color="#888" />
          <div><div className="stat-val">{vms.length}</div><div className="stat-label">Total</div></div>
        </div>
        <div className="stat-box" style={{ background: '#0d2b1a', borderColor: '#1a4a2a' }}>
          <IconCircleCheck size={18} color="#22c55e" />
          <div><div className="stat-val" style={{ color: '#22c55e' }}>{active}</div><div className="stat-label">Running</div></div>
        </div>
        <div className="stat-box">
          <IconPlayerStop size={18} color="#555" />
          <div><div className="stat-val" style={{ color: '#888' }}>{stopped}</div><div className="stat-label">Stopped</div></div>
        </div>
        <div className="stat-box" style={{ background: errors > 0 ? '#2b1a1a' : undefined, borderColor: errors > 0 ? '#4a2a2a' : undefined }}>
          <IconAlertCircle size={18} color={errors > 0 ? '#ef4444' : '#555'} />
          <div><div className="stat-val" style={{ color: errors > 0 ? '#ef4444' : '#888' }}>{errors}</div><div className="stat-label">Errors</div></div>
        </div>
        <div className="stat-box">
          <RingGauge pct={activePct} color="#22c55e" />
          <div><div className="stat-val">{activePct}%</div><div className="stat-label">Actif</div></div>
        </div>
      </div>

      {vms.length === 0 && !error ? (
        <div className="state-empty">Aucune instance trouvée</div>
      ) : (
        <div className="grid-3">
          {vms.map(vm => (
            <VMCard key={vm.id} vm={vm} onRefresh={fetchVms} />
          ))}
        </div>
      )}
    </>
  )
}
