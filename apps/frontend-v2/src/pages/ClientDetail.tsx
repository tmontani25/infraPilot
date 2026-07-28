import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconBuilding, IconServer2, IconFolder, IconChevronRight, IconPlus } from '@tabler/icons-react'
import { useProviders } from '../providerContext'
import { updateClient } from '../services/clients'
import { getServeurs } from '../services/serveurs'
import { getErrorMessage } from '../lib/errors'
import CreateServeurForm from '../components/serveurs/CreateServeurForm'
import type { Client, Serveur, Hebergement } from '../types'

type Tab = 'informations' | 'serveurs' | 'actions'
const TABS: { id: Tab; label: string }[] = [
  { id: 'informations', label: 'Informations' },
  { id: 'serveurs',     label: 'Serveurs' },
  { id: 'actions',      label: 'Actions' },
]

const HEBERGEMENT_LABEL: Record<Hebergement, string> = {
  interne: 'Interne',
  public_cloud: 'Public Cloud',
  vps: 'VPS',
}

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { clients, projectsByClient, loading, refresh } = useProviders()
  const [tab, setTab] = useState<Tab>('informations')
  const [serveurs, setServeurs] = useState<Serveur[]>([])
  const [loadingServeurs, setLoadingServeurs] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const client = clients.find((c) => c.id === Number(clientId))

  const loadServeurs = useCallback(async () => {
    if (!clientId) return
    try {
      setServeurs(await getServeurs(Number(clientId)))
      setError(null)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoadingServeurs(false)
    }
  }, [clientId])

  useEffect(() => { loadServeurs() }, [loadServeurs])

  if (loading) return <div className="state-empty">Chargement…</div>
  if (!client) return <div className="state-error">Client introuvable</div>

  const projects = projectsByClient[client.id] ?? []

  return (
    <>
      <div className="vm-detail-header">
        <button className="vm-detail-back" onClick={() => navigate('/clients')}>
          <IconArrowLeft size={13} />
          Clients
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div className="vm-detail-icon"><IconBuilding size={16} /></div>
          <div className="vm-detail-name">{client.name}</div>
        </div>
      </div>

      <div className="tab-bar" style={{ background: 'transparent', border: 'none', padding: 0, height: 'auto' }}>
        {TABS.map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'informations' && <InformationsTab client={client} onSaved={refresh} />}

      {tab === 'serveurs' && (
        <ServeursTab
          clientId={client.id}
          serveurs={serveurs}
          loading={loadingServeurs}
          error={error}
          onChanged={loadServeurs}
        />
      )}

      {tab === 'actions' && <ActionsTab clientId={client.id} projects={projects} onServeurCreated={loadServeurs} />}
    </>
  )
}

function InformationsTab({ client, onSaved }: { client: Client; onSaved: () => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [address, setAddress] = useState(client.address ?? '')
  const [contacts, setContacts] = useState(client.contacts ?? '')
  const [contrats, setContrats] = useState(client.contrats ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await updateClient(client.id, {
        address: address.trim() || null,
        contacts: contacts.trim() || null,
        contrats: contrats.trim() || null,
      })
      setEditing(false)
      await onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card-title">Modifier les informations</div>
        <div className="form-group"><label className="form-label">Adresse</label><input className="form-input" value={address} onChange={e => setAddress(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Contacts</label><textarea className="form-input" style={{ minHeight: 60 }} value={contacts} onChange={e => setContacts(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Contrats</label><textarea className="form-input" style={{ minHeight: 60 }} value={contrats} onChange={e => setContrats(e.target.value)} /></div>
        {error && <div className="state-error">{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" disabled={submitting}>Enregistrer</button>
          <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Annuler</button>
        </div>
      </form>
    )
  }

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        Informations
        <button className="btn-secondary" style={{ height: 24, fontSize: 10, padding: '0 8px' }} onClick={() => setEditing(true)}>Modifier</button>
      </div>
      <div className="vm-detail-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="vm-info-box"><div className="vm-info-label">Nom</div><div className="vm-info-val">{client.name}</div></div>
        <div className="vm-info-box"><div className="vm-info-label">Adresse</div><div className="vm-info-val">{client.address ?? '—'}</div></div>
        <div className="vm-info-box"><div className="vm-info-label">Contacts</div><div className="vm-info-val" style={{ whiteSpace: 'pre-wrap' }}>{client.contacts ?? '—'}</div></div>
        <div className="vm-info-box"><div className="vm-info-label">Contrats</div><div className="vm-info-val" style={{ whiteSpace: 'pre-wrap' }}>{client.contrats ?? '—'}</div></div>
      </div>
    </div>
  )
}

function ServeursTab({ clientId, serveurs, loading, error, onChanged }: {
  clientId: number
  serveurs: Serveur[]
  loading: boolean
  error: string | null
  onChanged: () => Promise<void>
}) {
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)

  if (loading) return <div className="state-empty">Chargement…</div>

  return (
    <>
      {error && <div className="state-error">{error}</div>}

      {showCreate ? (
        <CreateServeurForm
          defaultClientId={clientId}
          onCreated={() => { setShowCreate(false); onChanged() }}
          onCancel={() => setShowCreate(false)}
        />
      ) : (
        <button className="btn-create-vm" onClick={() => setShowCreate(true)}>
          <IconPlus size={12} />
          Nouveau serveur
        </button>
      )}

      {serveurs.length === 0 ? (
        <div className="state-empty">Aucun serveur pour ce client</div>
      ) : (
        <div className="grid-3">
          {serveurs.map(s => (
            <div key={s.id} className="vm-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/servers/${s.id}`)}>
              <div className="vm-card-hd">
                <div className="vm-detail-icon" style={{ width: 30, height: 30 }}><IconServer2 size={16} /></div>
                <div style={{ flex: 1 }}>
                  <div className="vm-name">{s.name}</div>
                  <div className="vm-id">{HEBERGEMENT_LABEL[s.hebergement]} · {s.os}</div>
                </div>
                <IconChevronRight size={14} color="#555" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function ActionsTab({ clientId, projects, onServeurCreated }: {
  clientId: number
  projects: { id: number; name: string }[]
  onServeurCreated: () => Promise<void>
}) {
  const navigate = useNavigate()
  const [showCreateServeur, setShowCreateServeur] = useState(false)

  return (
    <>
      <div className="card">
        <div className="card-title">Actions</div>
        {showCreateServeur ? (
          <CreateServeurForm
            defaultClientId={clientId}
            onCreated={() => { setShowCreateServeur(false); onServeurCreated() }}
            onCancel={() => setShowCreateServeur(false)}
          />
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => setShowCreateServeur(true)}>
              <IconPlus size={12} /> Créer un serveur
            </button>
            <button className="btn-secondary" onClick={() => navigate('/settings')}>
              <IconPlus size={12} /> Créer un projet Public Cloud
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Projets Public Cloud de ce client</div>
        {projects.length === 0 ? (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>Aucun projet</div>
        ) : (
          projects.map(p => (
            <div
              key={p.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 6px', borderTop: '1px solid var(--border)' }}
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <IconFolder size={14} color="#60a5fa" />
              <div style={{ flex: 1, fontSize: 12, color: '#fff' }}>{p.name}</div>
              <IconChevronRight size={14} color="#555" />
            </div>
          ))
        )}
      </div>
    </>
  )
}

