import { useState, useEffect } from 'react'
import { IconX, IconServer } from '@tabler/icons-react'
import { createVm } from '../services/vms'
import { getImages, getFlavors } from '../services/catalog'
import { getNetworks } from '../services/networks'
import type { Image, Flavor, Network } from '../types'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function CreateVMModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [imageId, setImageId] = useState('')
  const [flavorId, setFlavorId] = useState('')
  const [networkId, setNetworkId] = useState('')

  const [images, setImages] = useState<Image[]>([])
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [networks, setNetworks] = useState<Network[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getImages(), getFlavors(), getNetworks()])
      .then(([imgs, flavs, nets]) => {
        setImages(imgs)
        setFlavors(flavs)
        setNetworks(nets)
        if (imgs[0]) setImageId(imgs[0].id)
        if (flavs[0]) setFlavorId(flavs[0].id)
        if (nets[0]) setNetworkId(nets[0].id)
      })
      .catch((e: unknown) => setOptionsError(e instanceof Error ? e.message : 'Erreur chargement'))
      .finally(() => setLoadingOptions(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !imageId || !flavorId || !networkId) return
    setSubmitting(true)
    setError(null)
    try {
      await createVm(name.trim(), imageId, flavorId, networkId)
      onCreated()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur création VM')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedFlavor = flavors.find(f => f.id === flavorId)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="modal-icon"><IconServer size={14} /></div>
            <div>
              <div className="modal-title">Créer une VM</div>
              <div className="modal-sub">Instance OpenStack Infomaniak</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><IconX size={14} /></button>
        </div>

        {loadingOptions ? (
          <div className="modal-loading">Chargement des ressources…</div>
        ) : optionsError ? (
          <div className="state-error" style={{ margin: '0 0 12px' }}>{optionsError}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nom de l'instance</label>
                <input
                  className="form-input"
                  placeholder="ex: web-prod-01"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image</label>
                <select
                  className="form-select"
                  value={imageId}
                  onChange={e => setImageId(e.target.value)}
                  required
                >
                  {images.map(img => (
                    <option key={img.id} value={img.id}>{img.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Flavor</label>
                <select
                  className="form-select"
                  value={flavorId}
                  onChange={e => setFlavorId(e.target.value)}
                  required
                >
                  {flavors.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.vcpus} vCPU · {f.ram >= 1024 ? `${f.ram / 1024} GB` : `${f.ram} MB`} RAM · {f.disk} GB disk
                    </option>
                  ))}
                </select>
                {selectedFlavor && (
                  <div className="flavor-hint">
                    {selectedFlavor.vcpus} vCPU · {selectedFlavor.ram >= 1024 ? `${selectedFlavor.ram / 1024} GB` : `${selectedFlavor.ram} MB`} RAM · {selectedFlavor.disk} GB
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Réseau</label>
                <select
                  className="form-select"
                  value={networkId}
                  onChange={e => setNetworkId(e.target.value)}
                  required
                >
                  {networks.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>

              {error && <div className="state-error">{error}</div>}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !name.trim() || !imageId || !flavorId || !networkId}
              >
                {submitting ? 'Création…' : 'Créer la VM'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
