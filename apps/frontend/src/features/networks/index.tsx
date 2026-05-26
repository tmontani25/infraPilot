import { Network, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { useNetworks, useSubnets, type OsNetwork } from './api'

function networkStatusVariant(status: string) {
  if (status === 'ACTIVE') return 'default'
  if (status === 'DOWN') return 'destructive'
  return 'outline'
}

function subnetCidrs(network: OsNetwork, subnets: { id: string; cidr: string; network_id: string }[]) {
  const linked = subnets.filter((s) => s.network_id === network.id)
  if (linked.length === 0) return '—'
  return linked.map((s) => s.cidr).join(', ')
}

export function Networks() {
  const { data: networks = [], isLoading: loadingNetworks } = useNetworks()
  const { data: subnets = [] } = useSubnets()

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <Network className='size-5' />
          <h1 className='text-lg font-semibold'>Réseaux</h1>
        </div>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex gap-4 text-sm'>
          <div className='flex items-center gap-2 rounded-md border px-3 py-1.5'>
            <Globe className='size-4 text-muted-foreground' />
            <span className='font-medium'>{networks.length}</span>
            <span className='text-muted-foreground'>Réseaux</span>
          </div>
          <div className='flex items-center gap-2 rounded-md border px-3 py-1.5'>
            <span className='font-medium'>{subnets.length}</span>
            <span className='text-muted-foreground'>Sous-réseaux</span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>CIDRs</TableHead>
              <TableHead>Partagé</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingNetworks && (
              <TableRow>
                <TableCell colSpan={4} className='text-center text-muted-foreground'>
                  Chargement…
                </TableCell>
              </TableRow>
            )}
            {networks.map((network) => (
              <TableRow key={network.id}>
                <TableCell className='font-medium'>
                  {network.name || network.id}
                </TableCell>
                <TableCell>
                  <Badge variant={networkStatusVariant(network.status)}>
                    {network.status}
                  </Badge>
                </TableCell>
                <TableCell className='font-mono text-xs text-muted-foreground'>
                  {subnetCidrs(network, subnets)}
                </TableCell>
                <TableCell>
                  {network.shared ? (
                    <Badge variant='secondary'>Partagé</Badge>
                  ) : (
                    <span className='text-xs text-muted-foreground'>Privé</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!loadingNetworks && networks.length === 0 && (
          <div className='flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground'>
            <Network className='size-10' />
            <p className='text-sm'>Aucun réseau trouvé</p>
          </div>
        )}
      </Main>
    </>
  )
}
