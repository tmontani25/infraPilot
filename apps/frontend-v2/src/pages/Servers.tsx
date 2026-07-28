import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconServer2, IconSearch, IconPlus, IconChevronRight } from '@tabler/icons-react'
import { getServeurs } from '../services/serveurs'
import { getErrorMessage } from '../lib/errors'
import { useProviders } from '../providerContext'
import CreateServeurForm from '../components/serveurs/CreateServeurForm'
import type { Serveur, Hebergement } from '../types'

const HEBERGEMENT_LABEL: Record<Hebergement, string> = {
  interne: 'Interne',
  public_cloud: 'Public Cloud',
  vps: 'VPS',
}

export default function Servers() {
  const { clients } = useProviders()
  const navigate = useNavigate()

  const [serveurs, setServeurs] = useState<Serveur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | Hebergement>('all')
  const [showCreate, setShowCreate] = useState(false)

  const load = useCallback(async () => {
    try {
      setServeurs(await getServeurs())
      setError(null)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const clientName = (clientId: number | null) => clients.find(c => c.id === clientId)?.name ?? 'Indépendant'

  const filtered = serveurs.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || s.hebergement === filter
    return matchSearch && matchFilter
  })

  if (loading) return <div className="state-empty">Chargement…</div>

  return (
    <>
      <div className="overview-header">
        <div className="overview-icon"><IconServer2 size={20} /></div>
        <div>
          <div className="overview-title">Serveurs</div>
          <div className="overview-sub">Registre unifié (interne / VPS / Public Cloud)</div>
        </div>
        <button className="btn-create-vm" style={{ marginLeft: 'auto' }} onClick={() => setShowCreate(v => !v)}>
          <IconPlus size={12} />
          Nouveau serveur
        </button>
      </div>

      {error && <div className="state-error">{error}</div>}

      {showCreate && (
        <CreateServeurForm
          onCreated={() => { setShowCreate(false); load() }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <IconSearch size={13} color="#444" />
          <input placeholder="Rechercher un serveur…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-row">
          {(['all', 'public_cloud', 'vps', 'interne'] as const).map(f => (
            <button key={f} className={`fb ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Tous' : HEBERGEMENT_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="state-empty">Aucun serveur trouvé</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="tr-table">
            <thead>
              <tr>
                <th style={{ padding: '10px 12px' }}>Nom</th>
                <th>Client</th>
                <th>OS</th>
                <th>Hébergement</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/servers/${s.id}`)}>
                  <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 500 }}>{s.name}</td>
                  <td>{clientName(s.clientId)}</td>
                  <td>{s.os}</td>
                  <td>{HEBERGEMENT_LABEL[s.hebergement]}</td>
                  <td style={{ textAlign: 'right', paddingRight: 12 }}><IconChevronRight size={14} color="#555" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
