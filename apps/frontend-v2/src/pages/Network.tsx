import { useState, useEffect } from 'react'
import { getNetworks, getSubnets, getSecurityGroups } from '../services/networks'
import type { Network, Subnet, SecurityGroup } from '../types'

export default function Network() {
  const [networks, setNetworks] = useState<Network[]>([])
  const [subnets, setSubnets] = useState<Subnet[]>([])
  const [sgs, setSgs] = useState<SecurityGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getNetworks(), getSubnets(), getSecurityGroups()])
      .then(([n, s, sg]) => { setNetworks(n); setSubnets(s); setSgs(sg) })
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur API'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="state-empty">Chargement…</div>
  if (error)   return <div className="state-error">{error}</div>

  return (
    <>
      <div className="grid-3">
        <div className="card">
          <div className="card-title">Réseaux ({networks.length})</div>
          {networks.length === 0
            ? <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Aucun réseau</div>
            : networks.map(n => (
                <div key={n.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
                  <div style={{ color: '#fff', fontWeight: 500 }}>{n.name || '(sans nom)'}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{n.id.slice(0, 12)}…</div>
                </div>
              ))}
        </div>

        <div className="card">
          <div className="card-title">Subnets ({subnets.length})</div>
          {subnets.length === 0
            ? <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Aucun subnet</div>
            : subnets.map(s => (
                <div key={s.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
                  <div style={{ color: '#fff', fontWeight: 500 }}>{s.name || '(sans nom)'}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{s.cidr}</div>
                </div>
              ))}
        </div>

        <div className="card">
          <div className="card-title">Security Groups ({sgs.length})</div>
          {sgs.length === 0
            ? <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Aucun security group</div>
            : sgs.map(sg => (
                <div key={sg.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
                  <div style={{ color: '#fff', fontWeight: 500 }}>{sg.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{sg.description}</div>
                </div>
              ))}
        </div>
      </div>
    </>
  )
}
