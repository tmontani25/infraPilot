import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconLogout, IconChevronLeft } from '@tabler/icons-react'
import { useAuth } from '../authContext'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrateur',
  member: 'Membre',
}

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const initials = user?.username.slice(0, 2).toUpperCase() ?? '??'

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <div className="tb-logo">
        <div className="mark">IP</div>
        <div>
          <div className="tb-brand">Infrapilot</div>
          <div className="tb-sub">Infrastructure Management</div>
        </div>
      </div>
      {window.history.state?.idx > 0 && (
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <IconChevronLeft size={14} />
          Retour
        </button>
      )}
      <div className="tb-search">
        <IconSearch size={13} color="#555" />
        <input placeholder="Search..." />
      </div>
      <div className="spacer" />
      <div className="tb-live">
        <span className="dot" />
        Live
      </div>

      <div ref={ref} style={{ position: 'relative' }}>
        <div className="tb-user" onClick={() => setOpen(v => !v)}>
          <div className="tb-avatar">{initials}</div>
          {user?.username ?? 'Profil'}
        </div>

        {open && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <div style={styles.avatarLg}>{initials}</div>
              <div>
                <div style={styles.name}>{user?.username}</div>
                <div style={styles.email}>{user?.email}</div>
              </div>
            </div>
            <div style={styles.divider} />
            <div style={styles.roleRow}>
              <span style={styles.roleTag}>{ROLE_LABEL[user?.role ?? ''] ?? user?.role}</span>
            </div>
            <div style={styles.divider} />
            <button style={styles.logoutBtn} onClick={handleLogout}>
              <IconLogout size={13} />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 220,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 12,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
  },
  avatarLg: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  name: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  email: {
    fontSize: 11,
    color: 'var(--text-secondary)',
    marginTop: 2,
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '8px 0',
  },
  roleRow: {
    paddingBottom: 2,
  },
  roleTag: {
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 4,
    background: 'var(--input)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 12,
    cursor: 'pointer',
    marginLeft: 12,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '7px 8px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: 'var(--red)',
    fontSize: 12,
    cursor: 'pointer',
    width: '100%',
  },
}
