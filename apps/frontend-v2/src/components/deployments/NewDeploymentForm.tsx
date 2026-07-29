import { useState, useEffect, useRef } from 'react'
import { createDeployment } from '../../services/deployments'
import { getImages, getFlavors } from '../../services/catalog'
import { getNetworks } from '../../services/networks'
import { getErrorMessage } from '../../lib/errors'
import type { DeploymentTemplate, Machine, Image, Flavor, Network } from '../../types'

const EMPTY_MACHINE: Machine = { name: '', image_id: '', flavor_id: '', network_id: '' }

export type DeploymentPrefill = {
  templateId: string
  name: string
  variables: Record<string, unknown>
}

export default function NewDeploymentForm({
  templates,
  onCreated,
  prefill,
  onPrefillApplied,
}: {
  templates: DeploymentTemplate[]
  onCreated: () => Promise<void>
  prefill?: DeploymentPrefill | null
  onPrefillApplied?: () => void
}) {
  const [templateId, setTemplateId] = useState('')
  const [name, setName] = useState('')
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const skipResetRef = useRef(false)

  const template = templates.find(t => t.id === templateId)

  useEffect(() => {
    if (templates[0] && !templateId) setTemplateId(templates[0].id)
  }, [templates, templateId])

  // dupliquer un déploiement existant : on précharge template/nom/variables
  // sans déclencher le reset normal des valeurs sur changement de template
  useEffect(() => {
    if (!prefill) return
    skipResetRef.current = true
    setTemplateId(prefill.templateId)
    setName(prefill.name)
    setValues(prefill.variables)
    onPrefillApplied?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill])

  useEffect(() => {
    if (skipResetRef.current) {
      skipResetRef.current = false
      return
    }
    setValues({})
  }, [templateId])

  function isValid() {
    if (!template || !name.trim()) return false
    return template.variables.every(v => {
      if (v.type === 'machine_list') {
        const machines = (values[v.name] as Machine[] | undefined) ?? []
        return machines.length > 0 && machines.every(m => m.name && m.image_id && m.flavor_id && m.network_id)
      }
      return String(values[v.name] ?? '').trim() !== ''
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!template || !isValid()) return
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
            {v.type === 'machine_list' ? (
              <MachineListEditor
                value={(values[v.name] as Machine[] | undefined) ?? []}
                onChange={machines => setValues({ ...values, [v.name]: machines })}
              />
            ) : (
              <input
                className="form-input"
                value={String(values[v.name] ?? '')}
                onChange={e => setValues({ ...values, [v.name]: e.target.value })}
                required
              />
            )}
          </div>
        ))}

        {error && <div className="state-error">{error}</div>}

        <div>
          <button type="submit" className="btn-primary" disabled={submitting || !isValid()}>
            {submitting ? 'Planification…' : 'Planifier (tofu plan)'}
          </button>
        </div>
      </form>
    </div>
  )
}

function MachineListEditor({ value, onChange }: { value: Machine[]; onChange: (machines: Machine[]) => void }) {
  const rows = value.length > 0 ? value : [EMPTY_MACHINE]

  const [images, setImages] = useState<Image[]>([])
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [networks, setNetworks] = useState<Network[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getImages(), getFlavors(), getNetworks()])
      .then(([imgs, flavs, nets]) => { setImages(imgs); setFlavors(flavs); setNetworks(nets) })
      .catch(e => setCatalogError(getErrorMessage(e)))
      .finally(() => setLoadingCatalog(false))
  }, [])

  function updateRow(index: number, patch: Partial<Machine>) {
    onChange(rows.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

  function addRow() {
    onChange([...rows, { ...EMPTY_MACHINE }])
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index))
  }

  if (loadingCatalog) {
    return <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Chargement du catalogue (images/flavors/réseaux)…</div>
  }

  if (catalogError) {
    return <div className="state-error">{catalogError}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((m, i) => (
        <div key={i} style={{
          display: 'flex', flexDirection: 'column', gap: 6, padding: 10,
          border: '1px solid var(--border)', borderRadius: 6, background: 'var(--input)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Machine {i + 1}</span>
            {rows.length > 1 && (
              <button type="button" className="btn-secondary" onClick={() => removeRow(i)}>Supprimer</button>
            )}
          </div>

          <input className="form-input" placeholder="Nom de la VM" value={m.name}
            onChange={e => updateRow(i, { name: e.target.value })} />

          <select className="form-select" value={m.image_id} onChange={e => updateRow(i, { image_id: e.target.value })}>
            <option value="">Choisir une image…</option>
            {images.map(img => <option key={img.id} value={img.id}>{img.name}</option>)}
          </select>

          <select className="form-select" value={m.flavor_id} onChange={e => updateRow(i, { flavor_id: e.target.value })}>
            <option value="">Choisir un flavor…</option>
            {flavors.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} — {f.vcpus} vCPU · {f.ram >= 1024 ? `${f.ram / 1024} GB` : `${f.ram} MB`} RAM · {f.disk} GB disk
              </option>
            ))}
          </select>

          <select className="form-select" value={m.network_id} onChange={e => updateRow(i, { network_id: e.target.value })}>
            <option value="">Choisir un réseau…</option>
            {networks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>
      ))}
      <button type="button" className="btn-secondary" onClick={addRow}>+ Ajouter une machine</button>
    </div>
  )
}
