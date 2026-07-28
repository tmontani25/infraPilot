import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconServer, IconChevronDown } from '@tabler/icons-react'
import { useProviders } from '../providerContext'
import OpenstackTenantLabel from './ui/OpenstackTenantLabel'

export default function ProviderSelector() {
  const { clients, providers, activeProviderId, setActiveProvider, loading } = useProviders()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const active = providers.find((p) => p.id === activeProviderId)

  // regroupe les comptes cloud par client puis par projet (+ un groupe à part pour
  // les projets indépendants, sans client), pour retrouver visuellement le flow
  // client -> projet -> compte cloud
  function projectGroups(groupProviders: typeof providers) {
    const projectNames = [...new Set(groupProviders.map((p) => p.projectName))]
    return projectNames.map((projectName) => ({
      projectName,
      providers: groupProviders.filter((p) => p.projectName === projectName),
    }))
  }

  const clientGroups = clients
    .map((client) => ({
      key: `client-${client.id}`,
      label: client.name,
      projects: projectGroups(providers.filter((p) => p.clientId === client.id)),
    }))
    .filter((g) => g.projects.length > 0)

  const independentGroup = {
    key: 'independent',
    label: 'Projets indépendants',
    projects: projectGroups(providers.filter((p) => p.clientId == null)),
  }

  const groups = independentGroup.projects.length > 0 ? [...clientGroups, independentGroup] : clientGroups

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
        <span>{active ? `${active.clientName || 'Indépendant'} · ${active.projectName} · ${active.name}` : 'Choisir un compte cloud'}</span>
        <IconChevronDown size={12} />
      </div>

      {open && (
        <div style={styles.dropdown}>
          {groups.map((g) => (
            <div key={g.key}>
              <div style={styles.groupClient}>{g.label}</div>
              {g.projects.map((proj) => (
                <div key={proj.projectName}>
                  <div style={styles.groupProject}>{proj.projectName}</div>
                  {proj.providers.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        ...styles.option,
                        ...(p.id === activeProviderId ? styles.optionActive : {}),
                      }}
                      onClick={() => {
                        setActiveProvider(p.id)
                        setOpen(false)
                        navigate(`/projects/${p.projectId}`)
                      }}
                    >
                      <div style={styles.optionName}>{p.name}</div>
                      <div style={{ ...styles.optionMeta, display: 'flex', gap: 8 }}>
                        <span>{p.type}</span>
                        <OpenstackTenantLabel providerId={p.id} type={p.type} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
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
  groupClient: {
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '8px 10px 2px',
  },
  groupProject: {
    fontSize: 10,
    color: 'var(--text-secondary)',
    padding: '2px 10px 2px 18px',
  },
  option: {
    padding: '8px 10px 8px 24px',
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
