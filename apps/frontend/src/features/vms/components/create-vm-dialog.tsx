import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateVm,
  useImages,
  useFlavors,
  useNetworks,
} from '../api'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVmDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState('')
  const [imageId, setImageId] = useState('')
  const [flavorId, setFlavorId] = useState('')
  const [networkId, setNetworkId] = useState('')

  const { data: images = [], isLoading: loadingImages } = useImages()
  const { data: flavors = [], isLoading: loadingFlavors } = useFlavors()
  const { data: networks = [], isLoading: loadingNetworks } = useNetworks()
  const createVm = useCreateVm()

  const isReady = name.trim() && imageId && flavorId && networkId
  const isLoading = loadingImages || loadingFlavors || loadingNetworks

  function handleSubmit() {
    if (!isReady) return
    createVm.mutate(
      { name: name.trim(), image_id: imageId, flavor_id: flavorId, network_id: networkId },
      {
        onSuccess: () => {
          onOpenChange(false)
          setName('')
          setImageId('')
          setFlavorId('')
          setNetworkId('')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Créer une VM</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='vm-name'>Nom</Label>
            <Input
              id='vm-name'
              placeholder='ex: web-server-01'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className='space-y-1.5'>
            <Label>Image</Label>
            <Select value={imageId} onValueChange={setImageId} disabled={loadingImages}>
              <SelectTrigger>
                <SelectValue placeholder={loadingImages ? 'Chargement…' : 'Choisir une image'} />
              </SelectTrigger>
              <SelectContent>
                {images.map((img) => (
                  <SelectItem key={img.id} value={img.id}>
                    {img.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label>Flavor</Label>
            <Select value={flavorId} onValueChange={setFlavorId} disabled={loadingFlavors}>
              <SelectTrigger>
                <SelectValue placeholder={loadingFlavors ? 'Chargement…' : 'Choisir un flavor'} />
              </SelectTrigger>
              <SelectContent>
                {flavors.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} — {f.vcpus} vCPU / {f.ram} MB RAM / {f.disk} GB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label>Réseau</Label>
            <Select value={networkId} onValueChange={setNetworkId} disabled={loadingNetworks}>
              <SelectTrigger>
                <SelectValue placeholder={loadingNetworks ? 'Chargement…' : 'Choisir un réseau'} />
              </SelectTrigger>
              <SelectContent>
                {networks.map((net) => (
                  <SelectItem key={net.id} value={net.id}>
                    {net.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isReady || isLoading || createVm.isPending}
          >
            {createVm.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
