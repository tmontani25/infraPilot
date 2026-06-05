import { api } from '../lib/apiClient'

export type QuotaField = { used: number; limit: number }

export type Quotas = {
  instances?:       QuotaField
  vcpus?:           QuotaField
  ram_mb?:          QuotaField
  volumes?:         QuotaField
  gigabytes?:       QuotaField
  floating_ips?:    QuotaField
  security_groups?: QuotaField
}

export async function getQuotas(): Promise<Quotas> {
  const res = await api.get('/quotas')
  return res.data.data
}
