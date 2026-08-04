const STATUS_LABEL: Record<string, { cls: string; label: string }> = {
  pending: { cls: 'sp-build',  label: 'En cours' },
  running: { cls: 'sp-build',  label: 'En cours' },
  success: { cls: 'sp-active', label: 'Succès' },
  failed:  { cls: 'sp-error',  label: 'Échec' },
}

export default function PlaybookRunStatusPill({ status }: { status: string }) {
  const { cls, label } = STATUS_LABEL[status] ?? { cls: 'sp-shutoff', label: status }
  return <span className={`status-pill ${cls}`}>{label}</span>
}
