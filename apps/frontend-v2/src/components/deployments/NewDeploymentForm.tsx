import { useState, useEffect } from 'react'
import { createDeployment } from '../../services/deployments'
import { getErrorMessage } from '../../lib/errors'
import type { DeploymentTemplate } from '../../types'

export default function NewDeploymentForm({
  templates,
  onCreated,
}: {
  templates: DeploymentTemplate[]
  onCreated: () => Promise<void>
}) {
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
