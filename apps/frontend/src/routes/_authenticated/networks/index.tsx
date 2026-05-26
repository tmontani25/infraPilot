import { createFileRoute } from '@tanstack/react-router'
import { Networks } from '@/features/networks'

export const Route = createFileRoute('/_authenticated/networks/')({
  component: Networks,
})
