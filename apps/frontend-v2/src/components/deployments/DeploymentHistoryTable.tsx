import { useState, Fragment } from 'react'
import { applyDeployment, destroyDeployment } from '../../services/deployments'
import { getErrorMessage } from '../../lib/errors'
import DeploymentStatusPill from './DeploymentStatusPill'
import type { Deployment } from '../../types'

export default function DeploymentHistoryTable({
  deployments,
  onChanged,
  onDuplicate,
  title = 'Historique des déploiements',
  emptyMessage = 'Aucun déploiement',
}: {
  deployments: Deployment[]
  onChanged: () => Promise<void>
  onDuplicate?: (deployment: Deployment) => void
  title?: string
  emptyMessage?: string
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleApply(id: number) {
    setBusyId(id)
    setError(null)
    try {
      await applyDeployment(id)
      await onChanged()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDestroy(id: number) {
    if (!confirm('Détruire cette infrastructure ? Cette action est irréversible.')) return
    setBusyId(id)
    setError(null)
    try {
      await destroyDeployment(id)
      await onChanged()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      {error && <div className="state-error" style={{ marginBottom: 8 }}>{error}</div>}
      {deployments.length === 0 ? (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>{emptyMessage}</div>
      ) : (
        <table className="tr-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Template</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {deployments.map(d => (
              <Fragment key={d.id}>
                <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}>
                  <td style={{ color: '#fff', fontWeight: 500 }}>{d.name}</td>
                  <td>{d.templateId}</td>
                  <td><DeploymentStatusPill status={d.status} /></td>
                  <td style={{ fontSize: 9 }}>{new Date(d.createdAt).toLocaleString()}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {d.status === 'planned' && (
                        <button className="btn-primary" disabled={busyId === d.id} onClick={() => handleApply(d.id)}>
                          {busyId === d.id ? 'Application…' : 'Apply'}
                        </button>
                      )}
                      {(d.status === 'applied' || d.status === 'planned') && (
                        <button className="btn-secondary" disabled={busyId === d.id} onClick={() => handleDestroy(d.id)}>
                          {busyId === d.id ? 'Destruction…' : 'Destroy'}
                        </button>
                      )}
                      {onDuplicate && (
                        <button className="btn-secondary" onClick={() => onDuplicate(d)}>Dupliquer</button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === d.id && (
                  <tr>
                    <td colSpan={5}>
                      <DeploymentLogs deployment={d} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function DeploymentLogs({ deployment }: { deployment: Deployment }) {
  const logs = [
    { label: 'Plan', output: deployment.planOutput },
    { label: 'Apply', output: deployment.applyOutput },
    { label: 'Destroy', output: deployment.destroyOutput },
  ].filter(l => l.output)

  if (logs.length === 0) {
    return <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>Pas de logs</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
      {logs.map(l => (
        <div key={l.label}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{l.label}</div>
          <pre style={{
            fontSize: 10, color: '#ccc', background: 'var(--input)', border: '1px solid var(--border)',
            borderRadius: 6, padding: 10, overflowX: 'auto', maxHeight: 240, whiteSpace: 'pre-wrap', margin: 0,
          }}>{l.output}</pre>
        </div>
      ))}
    </div>
  )
}
