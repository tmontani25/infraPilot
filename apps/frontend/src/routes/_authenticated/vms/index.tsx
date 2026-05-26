import { createFileRoute } from '@tanstack/react-router'
import { Vms } from '@/features/vms'

export const Route = createFileRoute('/_authenticated/vms/')({
  component: Vms,
})
