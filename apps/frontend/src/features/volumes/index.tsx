import { Trash2 } from 'lucide-react'
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
import { useVolumes, useDeleteVolume, type Volume } from './api'

function volumeStatusVariant(status: string) {
  if (status === 'available') return 'default'
  if (status === 'in-use') return 'secondary'
  if (status === 'error') return 'destructive'
  return 'outline'
}

function attachedTo(volume: Volume) {
  if (!volume.attachments || volume.attachments.length === 0) return '—'
  return volume.attachments.map((a) => a.device).join(', ')
}

export function Volumes() {
  const { data: volumes, isLoading } = useVolumes()
  const deleteVolume = useDeleteVolume()

  return (
    <>
      <Header>
        <h1 className='text-lg font-semibold'>Volumes</h1>
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
              <TableHead>Taille</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Attaché à</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-muted-foreground'>
                  Chargement...
                </TableCell>
              </TableRow>
            )}
            {volumes?.map((volume) => (
              <TableRow key={volume.id}>
                <TableCell className='font-medium'>{volume.name || volume.id}</TableCell>
                <TableCell>{volume.size} GB</TableCell>
                <TableCell>
                  <Badge variant={volumeStatusVariant(volume.status)}>
                    {volume.status}
                  </Badge>
                </TableCell>
                <TableCell className='text-sm text-muted-foreground'>
                  {attachedTo(volume)}
                </TableCell>
                <TableCell>
                  <Button
                    size='icon'
                    variant='ghost'
                    title='Supprimer'
                    className='text-destructive hover:text-destructive'
                    disabled={volume.status === 'in-use' || deleteVolume.isPending}
                    onClick={() => deleteVolume.mutate(volume.id)}
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Main>
    </>
  )
}
