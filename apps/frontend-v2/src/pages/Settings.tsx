import { useAuth } from '../authContext'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrateur',
  member: 'Membre',
}

export default function Settings() {
  const { user } = useAuth()

  return (
    <div style={{ padding: '24px', maxWidth: 480 }}>
      <h2 style={{ marginBottom: 24, fontSize: 16, fontWeight: 600 }}>Réglages du compte</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Nom d'utilisateur" value={user?.username ?? ''} />
        <Field label="Email" value={user?.email ?? ''} />
        <Field label="Rôle" value={ROLE_LABEL[user?.role ?? ''] ?? user?.role ?? ''} />
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
