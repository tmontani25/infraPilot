import { useState, useEffect, useCallback } from 'react'
import { getTemplates, getDeployments } from '../services/deployments'
import { getErrorMessage } from '../lib/errors'
import NewDeploymentForm, { type DeploymentPrefill } from '../components/deployments/NewDeploymentForm'
import DeploymentHistoryTable from '../components/deployments/DeploymentHistoryTable'
import type { DeploymentTemplate, Deployment } from '../types'

export default function Deployments() {
  const [templates, setTemplates] = useState<DeploymentTemplate[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prefill, setPrefill] = useState<DeploymentPrefill | null>(null)

  const load = useCallback(async () => {
    const [t, d] = await Promise.all([getTemplates(), getDeployments()])
    setTemplates(t)
    setDeployments(d)
  }, [])

  useEffect(() => {
    load().catch(e => setError(getErrorMessage(e))).finally(() => setLoading(false))
  }, [load])

  if (loading) return <div className="state-empty">Chargement…</div>

  return (
    <>
      {error && <div className="state-error">{error}</div>}

      <NewDeploymentForm
        templates={templates}
        onCreated={load}
        prefill={prefill}
        onPrefillApplied={() => setPrefill(null)}
      />

      <DeploymentHistoryTable
        deployments={deployments}
        onChanged={load}
        onDuplicate={d => setPrefill({ templateId: d.templateId, name: `${d.name}-copie`, variables: d.variables })}
      />
    </>
  )
}
