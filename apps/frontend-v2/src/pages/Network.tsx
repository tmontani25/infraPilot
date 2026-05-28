import { useState, useEffect } from 'react'
import { IconNetwork, IconShieldCheck } from '@tabler/icons-react'
import { getNetworks, getSecurityGroups } from '../services/networks'
import type { Network, SecurityGroup } from '../types'

export default function NetworkPage() {
  const [networks, setNetworks] = useState<Network[]>([])
  const [sgs, setSgs] = useState<SecurityGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getNetworks(), getSecurityGroups()])
      .then(([nets, groups]) => { setNetworks(nets); setSgs(groups) })
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur API'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="state-empty">Chargement…</div>
  if (error)   return <div className="state-error">{error}</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <IconNetwork size={18} color="#a78bfa" />
          <div><div className="stat-val">{networks.length}</div><div className="stat-label">Réseaux</div></div>
        </div>
        <div className="stat-box">
          <IconNetwork size={18} color="#60a5fa" />
          <div><div className="stat-val">{networks.reduce((a, n) => a + n.subnets.length, 0)}</div><div className="stat-label">Subnets</div></div>
        </div>
        <div className="stat-box">
          <IconShieldCheck size={18} color="#4ade80" />
          <div><div className="stat-val">{sgs.length}</div><div className="stat-label">Security Groups</div></div>
        </div>
      </div>

      {/* Network table */}
      <div className="card">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconNetwork size={12} color="#888" /> Réseaux
        </div>
        {networks.length === 0 ? (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>Aucun réseau</div>
        ) : (
          <table className="tr-table">
            <thead>
              <tr>
                <th>Réseau</th>
                <th>Subnets / CIDR</th>
                <th>VMs connectées</th>
                <th>Public</th>
                <th>Routeur</th>
              </tr>
            </thead>
            <tbody>
              {networks.map(net => (
                <tr key={net.id}>
                  <td>
                    <div style={{ color: '#fff', fontWeight: 500, fontSize: 11 }}>{net.name || '(sans nom)'}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{net.id.slice(0, 12)}…</div>
                  </td>
                  <td>
                    {net.subnets.length === 0
                      ? <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>—</span>
                      : net.subnets.map(s => (
                          <div key={s.id} style={{ fontSize: 10, color: '#ccc', lineHeight: 1.8 }}>
                            <span style={{ fontFamily: 'monospace' }}>{s.cidr}</span>
                            {s.name && <span style={{ color: 'var(--text-muted)', marginLeft: 5 }}>{s.name}</span>}
                          </div>
                        ))
                    }
                  </td>
                  <td>
                    {net.connected_vms.length === 0
                      ? <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>—</span>
                      : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {net.connected_vms.map(vm => (
                            <span key={vm} className="net-vm-chip">{vm}</span>
                          ))}
                        </div>
                    }
                  </td>
                  <td>
                    <BoolBadge value={net.is_external} trueLabel="yes" falseLabel="no" trueColor="var(--blue)" />
                  </td>
                  <td>
                    <BoolBadge value={net.has_router} trueLabel="yes" falseLabel="no" trueColor="var(--green)" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Security Groups */}
      <div className="card">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconShieldCheck size={12} color="#888" /> Security Groups
        </div>
        {sgs.length === 0 ? (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>Aucun security group</div>
        ) : (
          <table className="tr-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Règles</th>
                <th>VMs</th>
              </tr>
            </thead>
            <tbody>
              {sgs.map(sg => (
                <tr key={sg.id}>
                  <td style={{ color: '#fff', fontWeight: 500, fontSize: 11 }}>{sg.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 10 }}>{sg.description || '—'}</td>
                  <td><span className="net-vm-chip">{sg.rules.length} règles</span></td>
                  <td>
                    {sg.connected_vms.length === 0
                      ? <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>—</span>
                      : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {sg.connected_vms.map(vm => (
                            <span key={vm} className="net-vm-chip">{vm}</span>
                          ))}
                        </div>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}

function BoolBadge({ value, trueLabel, falseLabel, trueColor }: {
  value: boolean; trueLabel: string; falseLabel: string; trueColor: string
}) {
  return (
    <span style={{
      fontSize: 9, padding: '2px 7px', borderRadius: 10, fontWeight: 500,
      background: value ? `${trueColor}22` : 'var(--input)',
      color: value ? trueColor : 'var(--text-muted)',
      border: `1px solid ${value ? `${trueColor}44` : 'var(--border)'}`,
    }}>
      {value ? trueLabel : falseLabel}
    </span>
  )
}
