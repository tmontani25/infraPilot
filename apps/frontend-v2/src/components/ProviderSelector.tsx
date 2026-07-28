import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconServer, IconChevronDown } from '@tabler/icons-react'
import { useProviders } from '../providerContext'

export default function ProviderSelector() {
  const { providers, activeProviderId, setActiveProvider, loading } = useProviders()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const active = providers.find((p) => p.id === activeProviderId)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (loading) return null

  if (providers.length === 0) {
    return (
      <button style={styles.emptyBtn} onClick={() => navigate('/settings')}>
        <IconServer size={13} />
        Configurer un compte cloud
      </button>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={styles.trigger} onClick={() => setOpen((v) => !v)}>
        <IconServer size={13} color="#60a5fa" />
        <span>{active ? `${active.clientName} — ${active.name}` : 'Choisir un compte cloud'}</span>
        <IconChevronDown size={12} />
      </div>

      {open && (
        <div style={styles.dropdown}>
          {providers.map((p) => (
            <div
              key={p.id}
              style={{
                ...styles.option,
                ...(p.id === activeProviderId ? styles.optionActive : {}),
              }}
              onClick={() => {
                setActiveProvider(p.id)
                setOpen(false)
              }}
            >
              <div style={styles.optionName}>{p.name}</div>
              <div style={styles.optionMeta}>{p.clientName} · {p.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'var(--input)',
    color: 'var(--text-primary)',
    fontSize: 12,
    cursor: 'pointer',
  },
  emptyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid var(--red)',
    background: 'transparent',
    color: 'var(--red)',
    fontSize: 12,
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    minWidth: 220,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 6,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  option: {
    padding: '8px 10px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  optionActive: {
    background: 'var(--input)',
  },
  optionName: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  optionMeta: {
    fontSize: 11,
    color: 'var(--text-secondary)',
    marginTop: 2,
  },
}
