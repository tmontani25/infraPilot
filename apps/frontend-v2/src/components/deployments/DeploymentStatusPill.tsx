const STATUS_LABEL: Record<string, { cls: string; label: string }> = {
  pending:   { cls: 'sp-build',   label: 'En attente' },
  planned:   { cls: 'sp-build',   label: 'Plan prêt' },
  applied:   { cls: 'sp-active',  label: 'Appliqué' },
  destroyed: { cls: 'sp-shutoff', label: 'Détruit' },
  failed:    { cls: 'sp-error',   label: 'Échec' },
}

export default function DeploymentStatusPill({ status }: { status: string }) {
  const { cls, label } = STATUS_LABEL[status] ?? { cls: 'sp-shutoff', label: status }
  return <span className={`status-pill ${cls}`}>{label}</span>
}
