import { useState, useEffect, useCallback, Fragment } from 'react'
import { getTemplates, getDeployments, createDeployment, applyDeployment, destroyDeployment } from '../services/deployments'
import { getErrorMessage } from '../lib/errors'
import type { DeploymentTemplate, Deployment } from '../types'

const STATUS_LABEL: Record<string, { cls: string; label: string }> = {
  pending:   { cls: 'sp-build',   label: 'En attente' },
  planned:   { cls: 'sp-build',   label: 'Plan prêt' },
  applied:   { cls: 'sp-active',  label: 'Appliqué' },
  destroyed: { cls: 'sp-shutoff', label: 'Détruit' },
  failed:    { cls: 'sp-error',   label: 'Échec' },
}

function StatusPill({ status }: { status: string }) {
  const { cls, label } = STATUS_LABEL[status] ?? { cls: 'sp-shutoff', label: status }
  return <span className={`status-pill ${cls}`}>{label}</span>
}

export default function Deployments() {
  const [templates, setTemplates] = useState<DeploymentTemplate[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    const [t, d] = await Promise.all([getTemplates(), getDeployments()])
    setTemplates(t)
    setDeployments(d)
  }, [])

  useEffect(() => {
    load().catch(e => setError(getErrorMessage(e))).finally(() => setLoading(false))
  }, [load])

  async function handleApply(id: number) {
    setBusyId(id)
    setError(null)
    try {
      await applyDeployment(id)
      await load()
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
      await load()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="state-empty">Chargement…</div>

  return (
    <>
      {error && <div className="state-error">{error}</div>}

      <NewDeploymentForm templates={templates} onCreated={load} />

      <div className="card">
        <div className="card-title">Historique des déploiements</div>
        {deployments.length === 0 ? (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>Aucun déploiement</div>
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
                    <td><StatusPill status={d.status} /></td>
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
    </>
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

function NewDeploymentForm({ templates, onCreated }: { templates: DeploymentTemplate[]; onCreated: () => Promise<void> }) {
  const [templateId, setTemplateId] = useState('')
  const [name, setName] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const template = templates.find(t => t.id === templateId)

  useEffect(() => {
    if (templates[0] && !templateId) setTemplateId(templates[0].id)
  }, [templates, templateId])

  useEffect(() => {
    setValues({})
  }, [templateId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!template || !name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await createDeployment(template.id, name.trim(), values)
      setName('')
      setValues({})
      await onCreated()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (templates.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Nouveau déploiement</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Aucun template disponible</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-title">Nouveau déploiement</div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Template</label>
          <select className="form-select" value={templateId} onChange={e => setTemplateId(e.target.value)}>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {template && <div className="flavor-hint">{template.description}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Nom du déploiement</label>
          <input
            className="form-input"
            placeholder="ex: vm-test-01"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        {template?.variables.map(v => (
          <div className="form-group" key={v.name}>
            <label className="form-label">{v.label}</label>
            <input
              className="form-input"
              value={values[v.name] ?? ''}
              onChange={e => setValues({ ...values, [v.name]: e.target.value })}
              required
            />
          </div>
        ))}

        {error && <div className="state-error">{error}</div>}

        <div>
          <button type="submit" className="btn-primary" disabled={submitting || !template || !name.trim()}>
            {submitting ? 'Planification…' : 'Planifier (tofu plan)'}
          </button>
        </div>
      </form>
    </div>
  )
}
