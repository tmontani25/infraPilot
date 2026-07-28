import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  IconArrowLeft, IconServer2, IconRefresh, IconPlayerStop, IconCamera,
  IconDownload, IconRocket, IconTrash, IconAlertTriangle, IconNote, IconTerminal2,
} from '@tabler/icons-react'
import {
  getServeur, getServeurLiveSpec, getServeurEvents, addServeurEvent,
  performServeurAction, updateServeur, deleteServeur,
} from '../services/serveurs'
import { useProviders } from '../providerContext'
import { getErrorMessage } from '../lib/errors'
import type { Serveur, ServeurLiveSpec, ServeurEvent, Hebergement } from '../types'

type Tab = 'infos' | 'acces' | 'sauvegardes' | 'historique' | 'actions'
const TABS: { id: Tab; label: string }[] = [
  { id: 'infos',       label: 'Infos' },
  { id: 'acces',       label: 'Accès' },
  { id: 'sauvegardes', label: 'Sauvegardes' },
  { id: 'historique',  label: 'Historique' },
  { id: 'actions',     label: 'Actions' },
]

const HEBERGEMENT_LABEL: Record<Hebergement, string> = {
  interne: 'Interne',
  public_cloud: 'Public Cloud',
  vps: 'VPS',
}

const BACKUP_METHODS = ['rsnapshot', 'rsync+diff', 'swissbackup', 'synology', 'restic']

export default function ServerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clients } = useProviders()

  const [serveur, setServeur] = useState<Serveur | null>(null)
  const [live, setLive] = useState<ServeurLiveSpec | null>(null)
  const [events, setEvents] = useState<ServeurEvent[]>([])
  const [tab, setTab] = useState<Tab>('infos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    try {
      const s = await getServeur(Number(id))
      setServeur(s)
      const [liveData, eventsData] = await Promise.all([
        s.hebergement === 'public_cloud' ? getServeurLiveSpec(s.id) : Promise.resolve(null),
        getServeurEvents(s.id),
      ])
      setLive(liveData)
      setEvents(eventsData)
      setError(null)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="state-empty">Chargement…</div>
  if (error)   return <div className="state-error">{error}</div>
  if (!serveur) return null

  const clientName = clients.find(c => c.id === serveur.clientId)?.name ?? 'Indépendant'

  return (
    <>
      <div className="vm-detail-header">
        <button className="vm-detail-back" onClick={() => navigate(-1)}>
          <IconArrowLeft size={13} />
          Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div className="vm-detail-icon"><IconServer2 size={16} /></div>
          <div>
            <div className="vm-detail-name">{serveur.name}</div>
            <div className="vm-detail-id">{clientName} · {HEBERGEMENT_LABEL[serveur.hebergement]}{live && ` · ${live.status}`}</div>
          </div>
        </div>
      </div>

      <div className="tab-bar" style={{ background: 'transparent', border: 'none', padding: 0, height: 'auto' }}>
        {TABS.map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'infos' && <InfosTab serveur={serveur} live={live} clientName={clientName} onSaved={load} />}
      {tab === 'acces' && <AccesTab serveur={serveur} onSaved={load} />}
      {tab === 'sauvegardes' && <SauvegardesTab serveur={serveur} onSaved={load} />}
      {tab === 'historique' && <HistoriqueTab serveurId={serveur.id} events={events} onChanged={load} />}
      {tab === 'actions' && (
        <ActionsTab
          serveur={serveur}
          onActionDone={load}
          onDeleted={() => navigate('/servers')}
        />
      )}
    </>
  )
}

function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="vm-info-box">
      <div className="vm-info-label">{label}</div>
      <div className="vm-info-val">{value}</div>
    </div>
  )
}

function InfosTab({ serveur, live, clientName, onSaved }: {
  serveur: Serveur
  live: ServeurLiveSpec | null
  clientName: string
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [os, setOs] = useState(serveur.os)
  const [distribution, setDistribution] = useState(serveur.distribution ?? '')
  const [deploymentType, setDeploymentType] = useState(serveur.deploymentType ?? '')
  const [cpu, setCpu] = useState(serveur.cpu?.toString() ?? '')
  const [ram, setRam] = useState(serveur.ram?.toString() ?? '')
  const [disk, setDisk] = useState(serveur.disk?.toString() ?? '')
  const [ip, setIp] = useState(serveur.ip ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLive = serveur.hebergement === 'public_cloud'

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await updateServeur(serveur.id, {
        os,
        distribution: distribution.trim() || null,
        deploymentType: deploymentType.trim() || null,
        ...(isLive ? {} : {
          cpu: cpu ? Number(cpu) : null,
          ram: ram ? Number(ram) : null,
          disk: disk ? Number(disk) : null,
          ip: ip.trim() || null,
        }),
      })
      setEditing(false)
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card-title">Modifier les infos</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <select className="form-select" value={os} onChange={e => setOs(e.target.value)}>
            <option value="linux">Linux</option>
            <option value="windows">Windows</option>
            <option value="synology">Synology</option>
          </select>
          <input className="form-input" placeholder="Distribution" value={distribution} onChange={e => setDistribution(e.target.value)} />
        </div>
        <select className="form-select" value={deploymentType} onChange={e => setDeploymentType(e.target.value)}>
          <option value="">Type de déploiement —</option>
          <option value="docker">Docker</option>
          <option value="proxmox">Proxmox</option>
          <option value="standalone">Standalone</option>
        </select>
        {!isLive && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input className="form-input" placeholder="CPU (vCPU)" value={cpu} onChange={e => setCpu(e.target.value)} />
            <input className="form-input" placeholder="RAM (Mo)" value={ram} onChange={e => setRam(e.target.value)} />
            <input className="form-input" placeholder="Disque (Go)" value={disk} onChange={e => setDisk(e.target.value)} />
            <input className="form-input" placeholder="IP" value={ip} onChange={e => setIp(e.target.value)} />
          </div>
        )}
        {error && <div className="state-error">{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" disabled={submitting}>Enregistrer</button>
          <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Annuler</button>
        </div>
      </form>
    )
  }

  const ramGo = (mb: number | null | undefined) => mb ? `${(mb / 1024).toFixed(1)} Go` : '—'

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        Infos
        <button className="btn-secondary" style={{ height: 24, fontSize: 10, padding: '0 8px' }} onClick={() => setEditing(true)}>Modifier</button>
      </div>
      <div className="vm-detail-grid">
        <InfoBox label="Nom" value={serveur.name} />
        <InfoBox label="Client" value={clientName} />
        <InfoBox label="OS" value={serveur.os} />
        <InfoBox label="Distribution" value={serveur.distribution ?? '—'} />
        <InfoBox label="Type de déploiement" value={serveur.deploymentType ?? '—'} />
        <InfoBox label="Créé le" value={new Date(serveur.createdAt).toLocaleDateString('fr-FR')} />
        {isLive ? (
          <>
            <InfoBox label="Statut (live)" value={live?.status ?? '—'} />
            <InfoBox label="CPU (live)" value={live?.specs ? `${live.specs.vcpus} vCPU` : '—'} />
            <InfoBox label="RAM (live)" value={ramGo(live?.specs?.ram)} />
            <InfoBox label="Disque (live)" value={live?.specs ? `${live.specs.disk} Go` : '—'} />
          </>
        ) : (
          <>
            <InfoBox label="CPU" value={serveur.cpu ? `${serveur.cpu} vCPU` : '—'} />
            <InfoBox label="RAM" value={ramGo(serveur.ram)} />
            <InfoBox label="Disque" value={serveur.disk ? `${serveur.disk} Go` : '—'} />
            <InfoBox label="Réseau" value={serveur.ip ?? '—'} />
          </>
        )}
      </div>
    </div>
  )
}

function AccesTab({ serveur, onSaved }: { serveur: Serveur; onSaved: () => void }) {
  const [editing, setEditing] = useState(false)
  const [ssh, setSsh] = useState(serveur.ssh ?? '')
  const [rdp, setRdp] = useState(serveur.rdp ?? '')
  const [vpn, setVpn] = useState(serveur.vpn ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await updateServeur(serveur.id, { ssh: ssh.trim() || null, rdp: rdp.trim() || null, vpn: vpn.trim() || null })
      setEditing(false)
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        Accès
        {!editing && <button className="btn-secondary" style={{ height: 24, fontSize: 10, padding: '0 8px' }} onClick={() => setEditing(true)}>Modifier</button>}
      </div>
      {editing ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group"><label className="form-label">SSH</label><input className="form-input" value={ssh} onChange={e => setSsh(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">RDP</label><input className="form-input" value={rdp} onChange={e => setRdp(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">VPN</label><input className="form-input" value={vpn} onChange={e => setVpn(e.target.value)} /></div>
          {error && <div className="state-error">{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" disabled={submitting}>Enregistrer</button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <div className="vm-detail-grid">
          <InfoBox label="IP" value={serveur.ip ?? '—'} />
          <InfoBox label="SSH" value={serveur.ssh ?? '—'} />
          <InfoBox label="RDP" value={serveur.rdp ?? '—'} />
          <InfoBox label="VPN" value={serveur.vpn ?? '—'} />
        </div>
      )}
    </div>
  )
}

function SauvegardesTab({ serveur, onSaved }: { serveur: Serveur; onSaved: () => void }) {
  const current: string[] = (() => { try { return JSON.parse(serveur.sauvegardes) } catch { return [] } })()
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle(method: string) {
    const next = current.includes(method) ? current.filter(m => m !== method) : [...current, method]
    setSaving(method)
    setError(null)
    try {
      await updateServeur(serveur.id, { sauvegardes: JSON.stringify(next) })
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="card">
      <div className="card-title">Sauvegardes</div>
      {error && <div className="state-error" style={{ marginBottom: 8 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {BACKUP_METHODS.map(method => (
          <button
            key={method}
            className={`fb ${current.includes(method) ? 'active' : ''}`}
            disabled={saving === method}
            onClick={() => toggle(method)}
          >
            {method}
          </button>
        ))}
      </div>
    </div>
  )
}

const EVENT_STYLE: Record<string, { icon: React.ReactNode; label: string }> = {
  incident: { icon: <IconAlertTriangle size={12} color="#ef4444" />, label: 'Incident' },
  log:      { icon: <IconTerminal2 size={12} color="#888" />,        label: 'Log' },
  update:   { icon: <IconDownload size={12} color="#60a5fa" />,      label: 'Mise à jour' },
  note:     { icon: <IconNote size={12} color="#f59e0b" />,          label: 'Note' },
}

function HistoriqueTab({ serveurId, events, onChanged }: { serveurId: number; events: ServeurEvent[]; onChanged: () => void }) {
  const [note, setNote] = useState('')
  const [incident, setIncident] = useState('')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(type: 'note' | 'incident', message: string, reset: () => void) {
    if (!message.trim()) return
    setSubmitting(type)
    setError(null)
    try {
      await addServeurEvent(serveurId, type, message.trim())
      reset()
      onChanged()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-title">Ajouter</div>
        {error && <div className="state-error" style={{ marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Ajouter une note…" value={note} onChange={e => setNote(e.target.value)} />
            <button className="btn-secondary" disabled={submitting === 'note'} onClick={() => submit('note', note, () => setNote(''))}>Note</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Signaler un incident…" value={incident} onChange={e => setIncident(e.target.value)} />
            <button className="btn-secondary" disabled={submitting === 'incident'} onClick={() => submit('incident', incident, () => setIncident(''))}>Incident</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Historique</div>
        {events.length === 0 ? (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>Rien pour l'instant</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {events.map(ev => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                {EVENT_STYLE[ev.type]?.icon}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#ccc' }}>{ev.message}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                    {EVENT_STYLE[ev.type]?.label ?? ev.type} · {new Date(ev.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function ActionsTab({ serveur, onActionDone, onDeleted }: {
  serveur: Serveur
  onActionDone: () => void
  onDeleted: () => void
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(action: string) {
    setBusy(action)
    setError(null)
    try {
      await performServeurAction(serveur.id, action)
      onActionDone()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer la fiche "${serveur.name}" ? Cette action ne supprime pas la VM sous-jacente si elle est hébergée en Public Cloud.`)) return
    setBusy('delete')
    setError(null)
    try {
      await deleteServeur(serveur.id)
      onDeleted()
    } catch (err) {
      setError(getErrorMessage(err))
      setBusy(null)
    }
  }

  const ACTIONS = [
    { id: 'restart', label: 'Redémarrer', icon: <IconRefresh size={13} /> },
    { id: 'stop',     label: 'Arrêter',    icon: <IconPlayerStop size={13} /> },
    { id: 'snapshot', label: 'Créer un snapshot', icon: <IconCamera size={13} /> },
    { id: 'update',   label: 'Mettre à jour',    icon: <IconDownload size={13} /> },
    { id: 'deploy',   label: 'Déployer',         icon: <IconRocket size={13} /> },
  ]

  return (
    <div className="card">
      <div className="card-title">Actions</div>
      {serveur.hebergement !== 'public_cloud' && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10 }}>
          Pas de VM liée : ces actions sont juste enregistrées dans l'historique (pas d'API disponible pour cet hébergement).
        </div>
      )}
      {error && <div className="state-error" style={{ marginBottom: 10 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ACTIONS.map(a => (
          <button key={a.id} className="btn-secondary" disabled={busy !== null} onClick={() => run(a.id)}>
            {a.icon} {busy === a.id ? '…' : a.label}
          </button>
        ))}
        <button className="btn-secondary" style={{ color: 'var(--red)' }} disabled={busy !== null} onClick={handleDelete}>
          <IconTrash size={13} /> {busy === 'delete' ? '…' : 'Supprimer la fiche'}
        </button>
      </div>
    </div>
  )
}
