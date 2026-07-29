import { useState, Fragment } from 'react'
import PlaybookRunStatusPill from './PlaybookRunStatusPill'
import type { PlaybookRun } from '../../types'

export default function PlaybookRunHistoryTable({
  runs,
  title = 'Historique des exécutions',
  emptyMessage = 'Aucune exécution',
}: {
  runs: PlaybookRun[]
  title?: string
  emptyMessage?: string
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      {runs.length === 0 ? (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>{emptyMessage}</div>
      ) : (
        <table className="tr-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Playbook</th>
              <th>Cibles</th>
              <th>Statut</th>
              <th>Lancé le</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(r => (
              <Fragment key={r.id}>
                <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                  <td style={{ color: '#fff', fontWeight: 500 }}>{r.name}</td>
                  <td>{r.playbookId}</td>
                  <td style={{ fontSize: 10 }}>{r.targetVms.map(v => v.name).join(', ')}</td>
                  <td><PlaybookRunStatusPill status={r.status} /></td>
                  <td style={{ fontSize: 9 }}>{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
                {expandedId === r.id && (
                  <tr>
                    <td colSpan={5}>
                      {r.output ? (
                        <pre style={{
                          fontSize: 10, color: '#ccc', background: 'var(--input)', border: '1px solid var(--border)',
                          borderRadius: 6, padding: 10, overflowX: 'auto', maxHeight: 300, whiteSpace: 'pre-wrap', margin: '8px 0',
                        }}>{r.output}</pre>
                      ) : (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '8px 0' }}>Pas de logs</div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
