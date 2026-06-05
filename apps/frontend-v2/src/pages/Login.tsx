import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.logo}>
          <div style={styles.mark}>IP</div>
          <span style={styles.brand}>infraPilot</span>
        </div>

        <h2 style={styles.title}>Connexion</h2>

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Mot de passe</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '36px 32px',
    width: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  mark: {
    width: 30,
    height: 30,
    background: 'var(--accent)',
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
  },
  brand: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: 'var(--text-secondary)',
  },
  input: {
    background: 'var(--input)',
    border: '1px solid var(--border)',
    borderRadius: 7,
    padding: '8px 12px',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
  },
  error: {
    fontSize: 12,
    color: 'var(--red)',
    background: '#2b1a1a',
    border: '1px solid #4a2a2a',
    borderRadius: 6,
    padding: '8px 12px',
  },
  btn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    padding: '10px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
  },
}
