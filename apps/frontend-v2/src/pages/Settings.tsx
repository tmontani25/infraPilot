import { useState } from 'react'
import { useAuth } from '../authContext'
import { useProviders } from '../providerContext'
import { createClient, deleteClient } from '../services/clients'
import { createProject, deleteProject } from '../services/projects'
import { createCloudProvider, deleteCloudProvider } from '../services/cloudProviders'
import type { Project, OpenstackCredentials } from '../types'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrateur',
  member: 'Membre',
}

const EMPTY_OPENSTACK_CREDENTIALS: OpenstackCredentials = {
  auth_url: '',
  project_id: '',
  project_name: '',
  username: '',
  password: '',
  user_domain_name: 'Default',
  project_domain_id: 'default',
  region_name: '',
  interface: 'public',
  identity_api_version: '3',
}

export default function Settings() {
  const { user } = useAuth()
  const { clients, projectsByClient, providers, refresh } = useProviders()

  return (
    <div style={{ padding: '24px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h2 style={{ marginBottom: 24, fontSize: 16, fontWeight: 600 }}>Réglages du compte</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Nom d'utilisateur" value={user?.username ?? ''} />
          <Field label="Email" value={user?.email ?? ''} />
          <Field label="Rôle" value={ROLE_LABEL[user?.role ?? ''] ?? user?.role ?? ''} />
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>Comptes cloud</h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Un client (ex: une étude d'avocats) regroupe un ou plusieurs projets, chacun
          regroupant un ou plusieurs comptes cloud (OpenStack, Proxmox, Hetzner).
          Le compte actif se choisit dans la barre du haut.
        </p>

        {clients.map((client) => (
          <ClientBlock
            key={client.id}
            client={client}
            projects={projectsByClient[client.id] ?? []}
            providers={providers.filter((p) => p.clientId === client.id)}
            onChanged={refresh}
          />
        ))}

        <AddClientForm onCreated={refresh} />
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{
        padding: '8px 12px',
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 6,
        fontSize: 13,
        color: '#e2e8f0',
      }}>
        {value}
      </span>
    </div>
  )
}

function ClientBlock({
  client,
  projects,
  providers,
  onChanged,
}: {
  client: { id: number; name: string }
  projects: Project[]
  providers: { id: number; projectId: number; name: string; type: string }[]
  onChanged: () => void
}) {
  const [showAddProject, setShowAddProject] = useState(false)

  async function handleDeleteClient() {
    if (!confirm(`Supprimer le client "${client.name}" et tous ses projets/comptes cloud ?`)) return
    await deleteClient(client.id)
    onChanged()
  }

  return (
    <div style={styles.clientBlock}>
      <div style={styles.clientHeader}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{client.name}</span>
        <button style={styles.linkBtn} onClick={handleDeleteClient}>Supprimer</button>
      </div>

      {projects.map((project) => (
        <ProjectBlock
          key={project.id}
          project={project}
          providers={providers.filter((p) => p.projectId === project.id)}
          onChanged={onChanged}
        />
      ))}

      {showAddProject ? (
        <AddProjectForm
          clientId={client.id}
          onCreated={() => { setShowAddProject(false); onChanged() }}
          onCancel={() => setShowAddProject(false)}
        />
      ) : (
        <button style={styles.addBtn} onClick={() => setShowAddProject(true)}>+ Ajouter un projet</button>
      )}
    </div>
  )
}

function ProjectBlock({
  project,
  providers,
  onChanged,
}: {
  project: Project
  providers: { id: number; name: string; type: string }[]
  onChanged: () => void
}) {
  const [showAddProvider, setShowAddProvider] = useState(false)

  async function handleDeleteProject() {
    if (!confirm(`Supprimer le projet "${project.name}" et tous ses comptes cloud ?`)) return
    await deleteProject(project.id)
    onChanged()
  }

  async function handleDeleteProvider(id: number) {
    if (!confirm('Supprimer ce compte cloud ?')) return
    await deleteCloudProvider(id)
    onChanged()
  }

  return (
    <div style={styles.projectBlock}>
      <div style={styles.projectHeader}>
        <span style={{ fontWeight: 500, fontSize: 12 }}>{project.name}</span>
        <button style={styles.linkBtn} onClick={handleDeleteProject}>Supprimer</button>
      </div>

      {providers.map((p) => (
        <div key={p.id} style={styles.providerRow}>
          <span>{p.name}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{p.type}</span>
          <button style={styles.linkBtn} onClick={() => handleDeleteProvider(p.id)}>Supprimer</button>
        </div>
      ))}

      {showAddProvider ? (
        <AddProviderForm
          projectId={project.id}
          onCreated={() => { setShowAddProvider(false); onChanged() }}
          onCancel={() => setShowAddProvider(false)}
        />
      ) : (
        <button style={styles.addBtn} onClick={() => setShowAddProvider(true)}>+ Ajouter un compte cloud</button>
      )}
    </div>
  )
}

function AddClientForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await createClient(name.trim())
      setName('')
      onCreated()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <input
        style={styles.input}
        placeholder="Nom du client (ex: Étude d'avocats X)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button style={styles.primaryBtn} disabled={submitting}>Ajouter un client</button>
    </form>
  )
}

function AddProjectForm({
  clientId,
  onCreated,
  onCancel,
}: {
  clientId: number
  onCreated: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await createProject(clientId, name.trim())
      onCreated()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...styles.providerForm, marginLeft: 0 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={styles.input}
          placeholder="Nom du projet (ex: Infra prod)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      {error && <div style={{ color: 'var(--red)', fontSize: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={styles.primaryBtn} disabled={submitting}>Créer</button>
        <button type="button" style={styles.linkBtn} onClick={onCancel}>Annuler</button>
      </div>
    </form>
  )
}

function AddProviderForm({
  projectId,
  onCreated,
  onCancel,
}: {
  projectId: number
  onCreated: () => void
  onCancel: () => void
}) {
  const [type, setType] = useState<'openstack' | 'proxmox' | 'hetzner'>('openstack')
  const [name, setName] = useState('')
  const [creds, setCreds] = useState<OpenstackCredentials>(EMPTY_OPENSTACK_CREDENTIALS)
  const [rawJson, setRawJson] = useState('{}')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    let credentials: Record<string, unknown>
    if (type === 'openstack') {
      credentials = { ...creds }
    } else {
      try {
        credentials = JSON.parse(rawJson)
      } catch {
        setError('JSON invalide')
        return
      }
    }

    setSubmitting(true)
    try {
      await createCloudProvider(projectId, { type, name, credentials })
      onCreated()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.providerForm}>
      <div style={{ display: 'flex', gap: 8 }}>
        <select style={styles.input} value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="openstack">OpenStack</option>
          <option value="proxmox">Proxmox</option>
          <option value="hetzner">Hetzner</option>
        </select>
        <input
          style={styles.input}
          placeholder="Nom du compte (ex: Infomaniak prod)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {type === 'openstack' ? (
        <div style={styles.credsGrid}>
          {(Object.keys(EMPTY_OPENSTACK_CREDENTIALS) as (keyof OpenstackCredentials)[]).map((field) => (
            <input
              key={field}
              style={styles.input}
              placeholder={field}
              type={field === 'password' ? 'password' : 'text'}
              value={creds[field]}
              onChange={(e) => setCreds({ ...creds, [field]: e.target.value })}
            />
          ))}
        </div>
      ) : (
        <textarea
          style={{ ...styles.input, minHeight: 80, fontFamily: 'monospace' }}
          placeholder='Credentials au format JSON, ex: {"host": "...", "token": "..."}'
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
        />
      )}

      {error && <div style={{ color: 'var(--red)', fontSize: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button style={styles.primaryBtn} disabled={submitting}>Créer</button>
        <button type="button" style={styles.linkBtn} onClick={onCancel}>Annuler</button>
      </div>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  clientBlock: {
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  clientHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectBlock: {
    marginLeft: 14,
    paddingLeft: 12,
    borderLeft: '2px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 12,
    padding: '6px 0',
    borderTop: '1px solid var(--border)',
  },
  addBtn: {
    alignSelf: 'flex-start',
    background: 'transparent',
    border: 'none',
    color: 'var(--accent)',
    fontSize: 12,
    cursor: 'pointer',
    padding: '6px 0',
  },
  linkBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: 11,
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  primaryBtn: {
    padding: '8px 14px',
    borderRadius: 6,
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  input: {
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'var(--input)',
    color: 'var(--text-primary)',
    fontSize: 12,
    flex: 1,
  },
  providerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 8,
    marginLeft: 14,
    padding: 10,
    background: 'var(--input)',
    borderRadius: 6,
  },
  credsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
}
