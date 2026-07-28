import { IconChartBar } from '@tabler/icons-react'

export default function Monitoring() {
  return (
    <>
      <div className="overview-header">
        <div className="overview-icon"><IconChartBar size={20} /></div>
        <div>
          <div className="overview-title">Monitoring</div>
          <div className="overview-sub">CPU / RAM / Disque / Réseau / Alertes / Hyperviseurs / Grafana</div>
        </div>
      </div>

      <div className="state-empty">
        À venir — dépend de l'intégration Prometheus/Grafana (Phase 4, pas encore commencée).
      </div>
    </>
  )
}
