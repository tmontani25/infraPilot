import { useState } from 'react'
import {
  Play,
  Square,
  RotateCcw,
  Trash2,
  Monitor,
  MoreVertical,
  Plus,
  Server,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
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
import { CreateVmDialog } from './components/create-vm-dialog'

type Filter = 'all' | 'active' | 'stopped'

function firstIp(vm: Vm) {
  if (!vm.addresses) return null
  const addrs = Object.values(vm.addresses).flat()
  return addrs.find((a) => a.version === 4)?.addr ?? null
}

function StatusDot({ status }: { status: string }) {
  const isActive = status === 'ACTIVE'
  const isError = status === 'ERROR'
  return (
    <span
      className={`inline-block size-2 rounded-full ${
        isActive
          ? 'bg-green-500'
          : isError
            ? 'bg-red-500'
            : 'bg-zinc-500'
      }`}
    />
  )
}

function VmCard({
  vm,
  onStart,
  onStop,
  onReboot,
  onDelete,
}: {
  vm: Vm
  onStart: () => void
  onStop: () => void
  onReboot: () => void
  onDelete: () => void
}) {
  const isActive = vm.status === 'ACTIVE'
  const ip = firstIp(vm)
  const shortId = vm.id.slice(0, 8)

  return (
    <div className='flex flex-col rounded-lg border bg-card text-card-foreground'>
      {/* Card header */}
      <div className='flex items-center gap-2 border-b px-4 py-3'>
        <Monitor className='size-4 shrink-0 text-muted-foreground' />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>{vm.name}</p>
          <p className='text-xs text-muted-foreground'>ID: {shortId}</p>
        </div>
        <StatusDot status={vm.status} />
      </div>

      {/* Card body */}
      <div className='flex-1 space-y-2 px-4 py-3 text-sm'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground'>Statut</span>
          <span
            className={`font-medium ${
              isActive ? 'text-green-500' : 'text-zinc-400'
            }`}
          >
            {vm.status}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground'>IP</span>
          <span className='font-mono text-xs'>{ip ?? '—'}</span>
        </div>
      </div>

      {/* Card footer — actions */}
      <div className='flex items-center gap-1 border-t px-3 py-2'>
        <Button
          size='icon'
          variant='ghost'
          className='size-7'
          title='Démarrer'
          disabled={isActive}
          onClick={onStart}
        >
          <Play className='size-3.5' />
        </Button>
        <Button
          size='icon'
          variant='ghost'
          className='size-7'
          title='Arrêter'
          disabled={!isActive}
          onClick={onStop}
        >
          <Square className='size-3.5' />
        </Button>
        <Button
          size='icon'
          variant='ghost'
          className='size-7'
          title='Redémarrer'
          disabled={!isActive}
          onClick={onReboot}
        >
          <RotateCcw className='size-3.5' />
        </Button>

        <div className='ms-auto'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='icon' variant='ghost' className='size-7'>
                <MoreVertical className='size-3.5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={onStart} disabled={isActive}>
                <Play className='mr-2 size-4' /> Démarrer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onStop} disabled={!isActive}>
                <Square className='mr-2 size-4' /> Arrêter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onReboot} disabled={!isActive}>
                <RotateCcw className='mr-2 size-4' /> Redémarrer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className='text-destructive focus:text-destructive'
              >
                <Trash2 className='mr-2 size-4' /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export function Vms() {
  const { data: vms = [], isLoading } = useVms()
  const startVm = useStartVm()
  const stopVm = useStopVm()
  const rebootVm = useRebootVm()
  const deleteVm = useDeleteVm()

  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [vmToDelete, setVmToDelete] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = vms.filter((vm) => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && vm.status === 'ACTIVE') ||
      (filter === 'stopped' && vm.status !== 'ACTIVE')
    const matchSearch = vm.name.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const runningCount = vms.filter((v) => v.status === 'ACTIVE').length
  const stoppedCount = vms.filter((v) => v.status !== 'ACTIVE').length

  return (
    <>
      <Header>
        <div className='flex items-center gap-3'>
          <Server className='size-5' />
          <h1 className='text-lg font-semibold'>Machines Virtuelles</h1>
        </div>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Stats bar */}
        <div className='mb-4 flex gap-4 text-sm'>
          <div className='flex items-center gap-2 rounded-md border px-3 py-1.5'>
            <Server className='size-4 text-muted-foreground' />
            <span className='font-medium'>{vms.length}</span>
            <span className='text-muted-foreground'>Total</span>
          </div>
          <div className='flex items-center gap-2 rounded-md border px-3 py-1.5'>
            <span className='size-2 rounded-full bg-green-500' />
            <span className='font-medium'>{runningCount}</span>
            <span className='text-muted-foreground'>Running</span>
          </div>
          <div className='flex items-center gap-2 rounded-md border px-3 py-1.5'>
            <span className='size-2 rounded-full bg-zinc-500' />
            <span className='font-medium'>{stoppedCount}</span>
            <span className='text-muted-foreground'>Stopped</span>
          </div>

          <Button size='sm' className='ms-auto gap-1' onClick={() => setCreateOpen(true)}>
            <Plus className='size-4' /> Créer une VM
          </Button>
        </div>

        {/* Filters */}
        <div className='mb-4 flex items-center gap-2'>
          <Input
            placeholder='Rechercher par nom...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='max-w-xs'
          />
          <div className='flex rounded-md border p-0.5'>
            {(['all', 'active', 'stopped'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'all' ? 'Tout' : f === 'active' ? 'Actif' : 'Arrêté'}
              </button>
            ))}
          </div>
          <span className='ms-auto text-xs text-muted-foreground'>
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid */}
        {isLoading && (
          <p className='text-sm text-muted-foreground'>Chargement...</p>
        )}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filtered.map((vm) => (
            <VmCard
              key={vm.id}
              vm={vm}
              onStart={() => startVm.mutate(vm.id)}
              onStop={() => stopVm.mutate(vm.id)}
              onReboot={() => rebootVm.mutate(vm.id)}
              onDelete={() => setVmToDelete(vm.id)}
            />
          ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className='flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground'>
            <Server className='size-10' />
            <p className='text-sm'>Aucune VM trouvée</p>
          </div>
        )}
      </Main>

      <CreateVmDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={vmToDelete !== null}
        onOpenChange={(open) => !open && setVmToDelete(null)}
        title='Supprimer la VM ?'
        desc='Cette action est irréversible. La VM sera définitivement supprimée.'
        destructive
        confirmText='Supprimer'
        handleConfirm={() => {
          if (vmToDelete) deleteVm.mutate(vmToDelete)
          setVmToDelete(null)
        }}
        isLoading={deleteVm.isPending}
      />
    </>
  )
}
