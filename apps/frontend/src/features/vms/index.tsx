import { Play, Square, RotateCcw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useVms,
  useStartVm,
  useStopVm,
  useRebootVm,
  useDeleteVm,
  type Vm,
} from './api'

function vmStatusVariant(status: string) {
  if (status === 'ACTIVE') return 'default'
  if (status === 'SHUTOFF') return 'secondary'
  if (status === 'ERROR') return 'destructive'
  return 'outline'
}

function firstIp(vm: Vm) {
  if (!vm.addresses) return '—'
  const networks = Object.values(vm.addresses)
  return networks[0]?.[0]?.addr ?? '—'
}

export function Vms() {
  const { data: vms, isLoading } = useVms()
  const startVm = useStartVm()
  const stopVm = useStopVm()
  const rebootVm = useRebootVm()
  const deleteVm = useDeleteVm()

  return (
    <>
      <Header>
        <h1 className='text-lg font-semibold'>Machines Virtuelles</h1>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className='text-center text-muted-foreground'>
                  Chargement...
                </TableCell>
              </TableRow>
            )}
            {vms?.map((vm) => (
              <TableRow key={vm.id}>
                <TableCell className='font-medium'>{vm.name}</TableCell>
                <TableCell>
                  <Badge variant={vmStatusVariant(vm.status)}>
                    {vm.status}
                  </Badge>
                </TableCell>
                <TableCell className='font-mono text-sm'>{firstIp(vm)}</TableCell>
                <TableCell>
                  <div className='flex gap-1'>
                    <Button
                      size='icon'
                      variant='ghost'
                      title='Démarrer'
                      disabled={vm.status === 'ACTIVE' || startVm.isPending}
                      onClick={() => startVm.mutate(vm.id)}
                    >
                      <Play className='size-4' />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      title='Arrêter'
                      disabled={vm.status !== 'ACTIVE' || stopVm.isPending}
                      onClick={() => stopVm.mutate(vm.id)}
                    >
                      <Square className='size-4' />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      title='Redémarrer'
                      disabled={vm.status !== 'ACTIVE' || rebootVm.isPending}
                      onClick={() => rebootVm.mutate(vm.id)}
                    >
                      <RotateCcw className='size-4' />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      title='Supprimer'
                      className='text-destructive hover:text-destructive'
                      disabled={deleteVm.isPending}
                      onClick={() => deleteVm.mutate(vm.id)}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Main>
    </>
  )
}
