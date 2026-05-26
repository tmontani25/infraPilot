import { createFileRoute } from '@tanstack/react-router'
import { Volumes } from '@/features/volumes'

export const Route = createFileRoute('/_authenticated/volumes/')({
  component: Volumes,
})
