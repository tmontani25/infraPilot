import { useState, useEffect } from 'react'
import { IconDatabase } from '@tabler/icons-react'
import { getVolumes } from '../services/volumes'
import { getVms } from '../services/vms'
import type { Volume, VM } from '../types'

function volumeStatusColor(status: string) {
  if (status === 'available') return '#22c55e'
  if (status === 'in-use')    return '#60a5fa'
  if (status === 'error')     return '#ef4444'
  return '#888'
}

export default function Datastore() {
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [vmNames, setVmNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getVolumes(), getVms()])
      .then(([vols, vms]) => {
        setVolumes(vols)
        setVmNames(Object.fromEntries(vms.map((vm: VM) => [vm.id, vm.name])))
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur API'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="state-empty">Chargement…</div>
  if (error)   return <div className="state-error">{error}</div>

  const totalGb = volumes.reduce((acc, v) => acc + v.size, 0)

  return (
    <>
      <div className="stats-row">
        <div className="stat-box">
          <IconDatabase size={18} color="#888" />
          <div><div className="stat-val">{volumes.length}</div><div className="stat-label">Volumes</div></div>
        </div>
        <div className="stat-box">
          <IconDatabase size={18} color="#60a5fa" />
          <div><div className="stat-val">{totalGb} GB</div><div className="stat-label">Total</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Volumes</div>
        {volumes.length === 0 ? (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>Aucun volume</div>
        ) : (
          <table className="tr-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>ID</th>
                <th>Taille</th>
                <th>Statut</th>
                <th>VM attachée</th>
              </tr>
            </thead>
            <tbody>
              {volumes.map(v => {
                const att = v.attachments?.[0] ?? null
                return (
                  <tr key={v.id}>
                    <td style={{ color: '#fff', fontWeight: 500 }}>{v.name || '(sans nom)'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 9 }}>{v.id.slice(0, 12)}…</td>
                    <td>{v.size} GB</td>
                    <td>
                      <span style={{ color: volumeStatusColor(v.status), fontSize: 10 }}>
                        {v.status}
                      </span>
                    </td>
                    <td>
                      {att?.server_id && vmNames[att.server_id]
                        ? <span style={{ color: '#ccc', fontSize: 10 }}>{vmNames[att.server_id]}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>—</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
