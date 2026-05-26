import { Server, HardDrive, Activity, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useVms } from '@/features/vms/api'
import { useVolumes } from '@/features/volumes/api'
import { cn } from '@/lib/utils'

function CircularProgress({
  value,
  size = 80,
  strokeWidth = 7,
  colorClass = 'text-primary',
}: {
  value: number
  size?: number
  strokeWidth?: number
  colorClass?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, value))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div
      className='relative flex items-center justify-center'
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className='-rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          className='text-muted/20'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(colorClass, 'transition-[stroke-dashoffset] duration-500 ease-out')}
        />
      </svg>
      <span className='absolute text-sm font-bold'>{clamped}%</span>
    </div>
  )
}

export function Dashboard() {
  const { data: vms = [], isLoading: loadingVms } = useVms()
  const { data: volumes = [], isLoading: loadingVolumes } = useVolumes()

  const isLoading = loadingVms || loadingVolumes

  const activeVms = vms.filter((v) => v.status === 'ACTIVE').length
  const errorVms = vms.filter((v) => v.status === 'ERROR').length
  const stoppedVms = vms.length - activeVms
  const usedVolumes = volumes.filter((v) => v.status === 'in-use').length
  const totalStorageGB = volumes.reduce((sum, v) => sum + (v.size || 0), 0)
  const activePercent = vms.length ? Math.round((activeVms / vms.length) * 100) : 0
  const usedVolumesPercent = volumes.length
    ? Math.round((usedVolumes / volumes.length) * 100)
    : 0

  return (
    <>
      <Header>
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-bold'>Vue d'ensemble</h1>
            <p className='text-sm text-muted-foreground'>OpenStack Infomaniak</p>
          </div>
        </div>

        {/* Row 1 — 4 stat cards */}
        <div className='mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardContent className='p-5'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    Machines
                  </p>
                  <p className='mt-1 text-3xl font-bold'>{isLoading ? '—' : vms.length}</p>
                </div>
                <div className='rounded-md bg-muted p-2'>
                  <Server className='size-4 text-muted-foreground' />
                </div>
              </div>
              <p className='mt-2 text-xs text-muted-foreground'>Total VMs</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-5'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    Actives
                  </p>
                  <p className='mt-1 text-3xl font-bold text-green-400'>
                    {isLoading ? '—' : activeVms}
                  </p>
                </div>
                <div className='rounded-md bg-green-500/10 p-2'>
                  <Activity className='size-4 text-green-400' />
                </div>
              </div>
              <p className='mt-2 text-xs text-muted-foreground'>
                {isLoading ? '' : `${stoppedVms} arrêtée${stoppedVms !== 1 ? 's' : ''}`}
              </p>
            </CardContent>
          </Card>

          <Card className='border-primary/20 bg-primary/5'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    VMs actives
                  </p>
                  <p className='mt-1 text-2xl font-bold text-primary'>
                    {isLoading ? '—' : `${activePercent}%`}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>UPTIME AVG</p>
                </div>
                {!isLoading && (
                  <CircularProgress value={activePercent} colorClass='text-primary' />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className='border-amber-500/20 bg-amber-500/5'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    Volumes
                  </p>
                  <p className='mt-1 text-2xl font-bold text-amber-400'>
                    {isLoading ? '—' : `${usedVolumesPercent}%`}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>UTILISÉS</p>
                </div>
                {!isLoading && (
                  <CircularProgress value={usedVolumesPercent} colorClass='text-amber-400' />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2 — Storage + Alertes */}
        <div className='mb-6 grid gap-4 sm:grid-cols-2'>
          <Card>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    Stockage total
                  </p>
                  <p className='mt-1 text-3xl font-bold'>
                    {isLoading ? '—' : `${totalStorageGB} GB`}
                  </p>
                  <p className='mt-2 text-xs text-muted-foreground'>
                    {isLoading
                      ? ''
                      : `${usedVolumes} volume${usedVolumes !== 1 ? 's' : ''} en utilisation`}
                  </p>
                </div>
                <div className='rounded-md bg-muted p-2'>
                  <HardDrive className='size-4 text-muted-foreground' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={errorVms > 0 ? 'border-red-500/20 bg-red-500/5' : ''}>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    Alertes
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-3xl font-bold',
                      errorVms > 0 ? 'text-red-400' : 'text-muted-foreground'
                    )}
                  >
                    {isLoading ? '—' : errorVms}
                  </p>
                  <p className='mt-2 text-xs text-muted-foreground'>
                    {isLoading ? '' : errorVms > 0 ? `VM${errorVms !== 1 ? 's' : ''} en erreur` : 'Aucune alerte'}
                  </p>
                </div>
                <div className={cn('rounded-md p-2', errorVms > 0 ? 'bg-red-500/10' : 'bg-muted')}>
                  <Bell
                    className={cn('size-4', errorVms > 0 ? 'text-red-400' : 'text-muted-foreground')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 3 — Resources table */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-semibold'>Top Resources</CardTitle>
            <span className='text-xs text-muted-foreground'>
              {!isLoading && `${vms.length} machine${vms.length !== 1 ? 's' : ''}`}
            </span>
          </CardHeader>
          <CardContent className='p-0'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b text-xs text-muted-foreground'>
                  <th className='px-4 py-2 text-left font-medium'>STATUS</th>
                  <th className='px-4 py-2 text-left font-medium'>NOM</th>
                  <th className='px-4 py-2 text-left font-medium'>IP</th>
                  <th className='px-4 py-2 text-left font-medium'>ÉTAT</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={4} className='px-4 py-8 text-center text-muted-foreground'>
                      Chargement...
                    </td>
                  </tr>
                )}
                {!isLoading && vms.length === 0 && (
                  <tr>
                    <td colSpan={4} className='px-4 py-8 text-center text-muted-foreground'>
                      Aucune VM
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  vms.map((vm) => {
                    const ip = vm.addresses
                      ? Object.values(vm.addresses)
                          .flat()
                          .find((a) => a.version === 4)?.addr
                      : null
                    const isActive = vm.status === 'ACTIVE'
                    const isError = vm.status === 'ERROR'
                    return (
                      <tr
                        key={vm.id}
                        className='border-b transition-colors last:border-0 hover:bg-muted/30'
                      >
                        <td className='px-4 py-3'>
                          <span
                            className={cn(
                              'inline-block size-2 rounded-full',
                              isActive
                                ? 'bg-green-400'
                                : isError
                                  ? 'bg-red-400'
                                  : 'bg-zinc-500'
                            )}
                          />
                        </td>
                        <td className='px-4 py-3 font-medium'>{vm.name}</td>
                        <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>
                          {ip ?? '—'}
                        </td>
                        <td className='px-4 py-3'>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                              isActive
                                ? 'bg-green-500/10 text-green-400'
                                : isError
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-zinc-500/10 text-zinc-400'
                            )}
                          >
                            <span
                              className={cn(
                                'size-1 rounded-full',
                                isActive
                                  ? 'bg-green-400'
                                  : isError
                                    ? 'bg-red-400'
                                    : 'bg-zinc-400'
                              )}
                            />
                            {isActive ? 'Running' : isError ? 'Error' : vm.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
