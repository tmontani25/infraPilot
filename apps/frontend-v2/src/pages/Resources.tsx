import { useState, useEffect, useCallback } from 'react'
import { IconSearch, IconRefresh, IconPlus } from '@tabler/icons-react'
import { getVms } from '../services/vms'
import VMCard from '../components/VMCard'
import CreateVMModal from '../components/CreateVMModal'
import type { VM } from '../types'

type Filter = 'all' | 'ACTIVE' | 'SHUTOFF' | 'ERROR'

export default function Resources() {
  const [vms, setVms] = useState<VM[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [showCreate, setShowCreate] = useState(false)

  const fetchVms = useCallback(async () => {
    try {
      const data = await getVms()
      setVms(data)
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur API")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVms() }, [fetchVms])

  const filtered = vms.filter(vm => {
    const matchSearch = vm.name.toLowerCase().includes(search.toLowerCase()) || vm.id.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || vm.status === filter
    return matchSearch && matchFilter
  })

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all',     label: 'Tous' },
    { id: 'ACTIVE',  label: 'Running' },
    { id: 'SHUTOFF', label: 'Stopped' },
    { id: 'ERROR',   label: 'Error' },
  ]

  if (loading) return <div className="state-empty">Chargement…</div>

  return (
    <>
      {showCreate && (
        <CreateVMModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchVms}
        />
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <IconSearch size={13} color="#444" />
          <input
            placeholder="Rechercher par nom ou ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-row">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`fb ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="vm-act-btn" onClick={fetchVms} title="Rafraîchir" style={{ width: 28, height: 28 }}>
          <IconRefresh size={13} />
        </button>
        <button className="btn-create-vm" onClick={() => setShowCreate(true)}>
          <IconPlus size={12} />
          Créer une VM
        </button>
      </div>

      {error && <div className="state-error">{error}</div>}

      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
        {filtered.length} instance{filtered.length !== 1 ? 's' : ''}
      </div>

      {filtered.length === 0 ? (
        <div className="state-empty">Aucune instance trouvée</div>
      ) : (
        <div className="grid-3">
          {filtered.map(vm => (
            <VMCard key={vm.id} vm={vm} onRefresh={fetchVms} />
          ))}
        </div>
      )}
    </>
  )
}
