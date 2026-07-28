import { useState, useEffect } from 'react'
import { getProjectForProvider } from '../../services/health'

// Récupère le vrai nom du tenant OpenStack d'un compte cloud, pour repérer une
// éventuelle divergence avec le nom donné en interne (ex: "Infomaniak (test 2)"
// vs le vrai tenant "PCP-EWVCU3A").
export function useOpenstackTenantName(providerId: number, type: string): string | null {
  const [tenantName, setTenantName] = useState<string | null>(null)

  useEffect(() => {
    if (type !== 'openstack') return
    let cancelled = false
    getProjectForProvider(providerId)
      .then((res) => { if (!cancelled) setTenantName(res.project_name) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [providerId, type])

  return tenantName
}

export default function OpenstackTenantLabel({ providerId, type }: { providerId: number; type: string }) {
  const tenantName = useOpenstackTenantName(providerId, type)
  if (!tenantName) return null
  return <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>tenant OpenStack : {tenantName}</span>
}
