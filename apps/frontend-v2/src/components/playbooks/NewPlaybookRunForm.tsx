import { useState, useEffect } from 'react'
import { getPlaybooks, createPlaybookRun } from '../../services/playbookRuns'
import { getVms } from '../../services/vms'
import { getErrorMessage } from '../../lib/errors'
import type { Playbook, VM } from '../../types'

export default function NewPlaybookRunForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [vms, setVms] = useState<VM[]>([])
  const [playbookId, setPlaybookId] = useState('')
  const [name, setName] = useState('')
  const [selectedVmIds, setSelectedVmIds] = useState<string[]>([])
  const [sshUser, setSshUser] = useState('ubuntu')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getPlaybooks(), getVms()])
      .then(([pbs, vmList]) => {
        setPlaybooks(pbs)
        setVms(vmList)
        if (pbs[0]) setPlaybookId(pbs[0].id)
      })
      .catch(e => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  function toggleVm(id: string) {
    setSelectedVmIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!playbookId || !name.trim() || selectedVmIds.length === 0) return
    setSubmitting(true)
    setError(null)
    try {
      await createPlaybookRun(playbookId, name.trim(), selectedVmIds, sshUser.trim() || 'ubuntu')
      setName('')
      setSelectedVmIds([])
      await onCreated()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const playbook = playbooks.find(p => p.id === playbookId)

  if (loading) {
    return (
      <div className="card">
        <div className="card-title">Lancer un playbook</div>
        <div className="state-empty">Chargement…</div>
      </div>
    )
  }

  if (playbooks.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Lancer un playbook</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Aucun playbook disponible</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-title">Lancer un playbook</div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Playbook</label>
          <select className="form-select" value={playbookId} onChange={e => setPlaybookId(e.target.value)}>
            {playbooks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {playbook && <div className="flavor-hint">{playbook.description}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Nom de l'exécution</label>
          <input
            className="form-input"
            placeholder="ex: nginx-prod-01"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Utilisateur SSH</label>
          <input className="form-input" value={sshUser} onChange={e => setSshUser(e.target.value)} placeholder="ubuntu" />
        </div>

        <div className="form-group">
          <label className="form-label">Machines cibles</label>
          {vms.length === 0 ? (
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Aucune VM dans ce projet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
              {vms.map(vm => (
                <label key={vm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ccc', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedVmIds.includes(vm.id)} onChange={() => toggleVm(vm.id)} />
                  {vm.name}
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{vm.status}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && <div className="state-error">{error}</div>}

        <div>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || !playbookId || !name.trim() || selectedVmIds.length === 0}
          >
            {submitting ? 'Exécution…' : 'Lancer le playbook'}
          </button>
        </div>
      </form>
    </div>
  )
}
