type ResourceSpec = { vcpus: number; ram: number; disk: number }

// Estimation indicative du coût d'une VM, basée sur ses ressources allouées
// (vCPU/RAM/disque). Pas de grille tarifaire réelle du fournisseur branchée pour
// l'instant : à recalibrer avec les vrais tarifs Infomaniak quand disponibles.
const PRICE_PER_VCPU_HOUR = 0.015
const PRICE_PER_GB_RAM_HOUR = 0.005
const PRICE_PER_GB_DISK_HOUR = 0.0002

const HOURS_PER_MONTH = 24 * 30

export function estimateHourlyCost(spec: ResourceSpec): number {
  const ramGb = spec.ram / 1024
  return spec.vcpus * PRICE_PER_VCPU_HOUR + ramGb * PRICE_PER_GB_RAM_HOUR + spec.disk * PRICE_PER_GB_DISK_HOUR
}

export function estimateMonthlyCost(spec: ResourceSpec): number {
  return estimateHourlyCost(spec) * HOURS_PER_MONTH
}
