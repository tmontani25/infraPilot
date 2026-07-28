import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconBuilding, IconServer2, IconCloud, IconRocket, IconAlertTriangle,
  IconCpu, IconDatabase,
} from '@tabler/icons-react'
import { useProviders } from '../providerContext'
import { getServeurs, getServeurEvents } from '../services/serveurs'
import { getVmsForProvider } from '../services/vms'
import { getDeployments } from '../services/deployments'
import { getErrorMessage } from '../lib/errors'
import DeploymentStatusPill from '../components/deployments/DeploymentStatusPill'
import type { Serveur, ServeurEvent, Deployment } from '../types'

export default function GlobalDashboard() {
  const { clients, providers, loading: providersLoading } = useProviders()
  const navigate = useNavigate()

  const [serveurs, setServeurs] = useState<Serveur[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [vmCount, setVmCount] = useState(0)
  const [totals, setTotals] = useState({ vcpus: 0, ramMb: 0, diskGb: 0 })
  const [recentIncidents, setRecentIncidents] = useState<{ serveurName: string; event: ServeurEvent }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [serveursData, deploymentsData] = await Promise.all([getServeurs(), getDeployments()])
      setServeurs(serveursData)
      setDeployments(deploymentsData)

      // VMs + ressources allouées : agrégées sur tous les comptes OpenStack connus
      // (les types sans worker, ex. proxmox/hetzner, sont ignorés silencieusement)
      const openstackProviders = providers.filter(p => p.type === 'openstack')
      const vmLists = await Promise.all(
        openstackProviders.map(p => getVmsForProvider(p.id).catch(() => []))
      )
      const allVms = vmLists.flat()
      setVmCount(allVms.length)

      const cloudTotals = allVms.reduce((acc, vm) => ({
        vcpus: acc.vcpus + vm.flavor.vcpus,
        ramMb: acc.ramMb + vm.flavor.ram,
        diskGb: acc.diskGb + vm.flavor.disk,
      }), { vcpus: 0, ramMb: 0, diskGb: 0 })

      const manualTotals = serveursData.reduce((acc, s) => ({
        vcpus: acc.vcpus + (s.cpu ?? 0),
        ramMb: acc.ramMb + (s.ram ?? 0),
        diskGb: acc.diskGb + (s.disk ?? 0),
      }), { vcpus: 0, ramMb: 0, diskGb: 0 })

      setTotals({
        vcpus: cloudTotals.vcpus + manualTotals.vcpus,
        ramMb: cloudTotals.ramMb + manualTotals.ramMb,
        diskGb: cloudTotals.diskGb + manualTotals.diskGb,
      })

      // incidents récents, tous serveurs confondus
      const eventLists = await Promise.all(
        serveursData.map(s => getServeurEvents(s.id).catch(() => []))
      )
      const allIncidents = serveursData.flatMap((s, i) =>
        eventLists[i].filter(e => e.type === 'incident').map(event => ({ serveurName: s.name, event }))
      )
      allIncidents.sort((a, b) => b.event.createdAt.localeCompare(a.event.createdAt))
      setRecentIncidents(allIncidents.slice(0, 5))

      setError(null)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [providers])

  useEffect(() => {
    if (!providersLoading) load()
  }, [providersLoading, load])

  if (loading || providersLoading) return <div className="state-empty">Chargement…</div>

  const recentDeployments = [...deployments]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <>
      <div className="overview-header">
        <div className="overview-icon"><IconServer2 size={20} /></div>
        <div>
          <div className="overview-title">Dashboard</div>
          <div className="overview-sub">Vue globale de la plateforme</div>
        </div>
      </div>

      {error && <div className="state-error">{error}</div>}

      <div className="stats-row">
        <div className="stat-box" style={{ cursor: 'pointer' }} onClick={() => navigate('/clients')}>
          <IconBuilding size={18} color="#f59e0b" />
          <div><div className="stat-val">{clients.length}</div><div className="stat-label">Clients</div></div>
        </div>
        <div className="stat-box" style={{ cursor: 'pointer' }} onClick={() => navigate('/servers')}>
          <IconServer2 size={18} color="#4ade80" />
          <div><div className="stat-val">{serveurs.length}</div><div className="stat-label">Serveurs</div></div>
        </div>
        <div className="stat-box" style={{ cursor: 'pointer' }} onClick={() => navigate('/cloud')}>
          <IconCloud size={18} color="#60a5fa" />
          <div><div className="stat-val">{vmCount}</div><div className="stat-label">VMs</div></div>
        </div>
        <div className="stat-box" style={{ cursor: 'pointer' }} onClick={() => navigate('/deployments')}>
          <IconRocket size={18} color="#e8690a" />
          <div><div className="stat-val">{deployments.length}</div><div className="stat-label">Déploiements</div></div>
        </div>
        <div className="stat-box" style={{ background: recentIncidents.length > 0 ? '#2b1a1a' : undefined, borderColor: recentIncidents.length > 0 ? '#4a2a2a' : undefined }}>
          <IconAlertTriangle size={18} color={recentIncidents.length > 0 ? '#ef4444' : '#555'} />
          <div><div className="stat-val" style={{ color: recentIncidents.length > 0 ? '#ef4444' : undefined }}>{recentIncidents.length}</div><div className="stat-label">Incidents récents</div></div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Ressources allouées (Public Cloud + saisies manuellement)
        </div>
        <div className="grid-3">
          <div className="stat-box">
            <IconCpu size={18} color="#60a5fa" />
            <div><div className="stat-val">{totals.vcpus}</div><div className="stat-label">vCPU</div></div>
          </div>
          <div className="stat-box">
            <IconCpu size={18} color="#a78bfa" />
            <div><div className="stat-val">{(totals.ramMb / 1024).toFixed(1)} Go</div><div className="stat-label">RAM</div></div>
          </div>
          <div className="stat-box">
            <IconDatabase size={18} color="#4ade80" />
            <div><div className="stat-val">{totals.diskGb} Go</div><div className="stat-label">Stockage</div></div>
          </div>
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 6 }}>
          Instantané agrégé, pas d'historique — les graphs de tendance viendront avec le Monitoring (Prometheus/Grafana, Phase 4).
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Derniers incidents</div>
          {recentIncidents.length === 0 ? (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>Aucun incident récent</div>
          ) : (
            recentIncidents.map(({ serveurName, event }) => (
              <div key={event.id} style={{ display: 'flex', gap: 8, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                <IconAlertTriangle size={12} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, color: '#ccc' }}>{event.message}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                    {serveurName} · {new Date(event.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title">Derniers déploiements</div>
          {recentDeployments.length === 0 ? (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>Aucun déploiement</div>
          ) : (
            recentDeployments.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#ccc' }}>{d.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                    {d.templateId} · {new Date(d.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
                <DeploymentStatusPill status={d.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
