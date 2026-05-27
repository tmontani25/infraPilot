interface StatusPillProps {
  status: string
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ACTIVE:   { label: 'Running',  cls: 'sp-active' },
  SHUTOFF:  { label: 'Stopped',  cls: 'sp-shutoff' },
  ERROR:    { label: 'Error',    cls: 'sp-error' },
  BUILD:    { label: 'Building', cls: 'sp-build' },
  PAUSED:   { label: 'Paused',   cls: 'sp-shutoff' },
  MIGRATING:{ label: 'Migrating',cls: 'sp-build' },
}

export default function StatusPill({ status }: StatusPillProps) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'sp-shutoff' }
  return <span className={`status-pill ${s.cls}`}>{s.label}</span>
}
