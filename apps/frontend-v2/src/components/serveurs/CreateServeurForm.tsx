import { useState, useEffect } from 'react'
import { createServeur } from '../../services/serveurs'
import { getVmsForProvider } from '../../services/vms'
import { getErrorMessage } from '../../lib/errors'
import { useProviders } from '../../providerContext'
import type { VM } from '../../types'

const BACKUP_METHODS = ['rsnapshot', 'rsync+diff', 'swissbackup', 'synology', 'restic']

export default function CreateServeurForm({
  defaultClientId,
  onCreated,
  onCancel,
}: {
  defaultClientId?: number | null
  onCreated: () => void
  onCancel: () => void
}) {
  const { clients, providers } = useProviders()

  const [clientId, setClientId] = useState<string>(defaultClientId != null ? String(defaultClientId) : '')
  const [name, setName] = useState('')
  const [hebergement, setHebergement] = useState<'interne' | 'public_cloud' | 'vps'>('public_cloud')
  const [os, setOs] = useState<'linux' | 'windows' | 'synology'>('linux')
  const [distribution, setDistribution] = useState('')
  const [deploymentType, setDeploymentType] = useState<'docker' | 'proxmox' | 'standalone' | ''>('')
  const [backups, setBackups] = useState<string[]>([])

  // Public Cloud : sélection du compte + de la VM à lier
  const [cloudProviderId, setCloudProviderId] = useState<string>('')
  const [cloudVmId, setCloudVmId] = useState('')
  const [vms, setVms] = useState<VM[]>([])
  const [loadingVms, setLoadingVms] = useState(false)

  // interne/VPS : caractéristiques saisies à la main
  const [cpu, setCpu] = useState('')
  const [ram, setRam] = useState('')
  const [disk, setDisk] = useState('')
  const [ip, setIp] = useState('')
  const [ssh, setSsh] = useState('')
  const [rdp, setRdp] = useState('')
  const [vpn, setVpn] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hebergement !== 'public_cloud' || !cloudProviderId) { setVms([]); return }
    setLoadingVms(true)
    getVmsForProvider(Number(cloudProviderId))
      .then(setVms)
      .catch(() => setVms([]))
      .finally(() => setLoadingVms(false))
  }, [hebergement, cloudProviderId])

  function toggleBackup(method: string) {
    setBackups((cur) => cur.includes(method) ? cur.filter(m => m !== method) : [...cur, method])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await createServeur({
        clientId: clientId ? Number(clientId) : null,
        name: name.trim(),
        hebergement,
        os,
        distribution: distribution.trim() || null,
        deploymentType: deploymentType || null,
        cloudProviderId: hebergement === 'public_cloud' && cloudProviderId ? Number(cloudProviderId) : null,
        cloudVmId: hebergement === 'public_cloud' && cloudVmId ? cloudVmId : null,
        cpu: hebergement !== 'public_cloud' && cpu ? Number(cpu) : null,
        ram: hebergement !== 'public_cloud' && ram ? Number(ram) : null,
        disk: hebergement !== 'public_cloud' && disk ? Number(disk) : null,
        ip: hebergement !== 'public_cloud' && ip ? ip.trim() : null,
        ssh: ssh.trim() || null,
        rdp: rdp.trim() || null,
        vpn: vpn.trim() || null,
        sauvegardes: JSON.stringify(backups),
      })
      onCreated()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card-title">Nouveau serveur</div>

      <div className="form-group">
        <label className="form-label">Nom</label>
        <input className="form-input" placeholder="ex: srv-nextcloud" value={name} onChange={e => setName(e.target.value)} required autoFocus />
      </div>

      <div className="form-group">
        <label className="form-label">Client</label>
        <select className="form-select" value={clientId} onChange={e => setClientId(e.target.value)}>
          <option value="">Aucun (serveur indépendant)</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Hébergement</label>
        <select className="form-select" value={hebergement} onChange={e => setHebergement(e.target.value as typeof hebergement)}>
          <option value="public_cloud">Public Cloud</option>
          <option value="vps">VPS</option>
          <option value="interne">Interne</option>
        </select>
      </div>

      {hebergement === 'public_cloud' ? (
        <>
          <div className="form-group">
            <label className="form-label">Compte cloud</label>
            <select className="form-select" value={cloudProviderId} onChange={e => { setCloudProviderId(e.target.value); setCloudVmId('') }}>
              <option value="">Choisir un compte…</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.clientName || 'Indépendant'} · {p.projectName} · {p.name}</option>
              ))}
            </select>
          </div>
          {cloudProviderId && (
            <div className="form-group">
              <label className="form-label">VM à lier</label>
              <select className="form-select" value={cloudVmId} onChange={e => setCloudVmId(e.target.value)} disabled={loadingVms}>
                <option value="">{loadingVms ? 'Chargement…' : 'Choisir une VM…'}</option>
                {vms.map(vm => <option key={vm.id} value={vm.id}>{vm.name}</option>)}
              </select>
              <div className="flavor-hint">Les caractéristiques (CPU/RAM/disque/statut/IP) viendront en direct de cette VM, pas besoin de les ressaisir.</div>
            </div>
          )}
        </>
      ) : (
        <div className="credsGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input className="form-input" placeholder="CPU (vCPU)" value={cpu} onChange={e => setCpu(e.target.value)} />
          <input className="form-input" placeholder="RAM (Mo)" value={ram} onChange={e => setRam(e.target.value)} />
          <input className="form-input" placeholder="Disque (Go)" value={disk} onChange={e => setDisk(e.target.value)} />
          <input className="form-input" placeholder="Adresse IP" value={ip} onChange={e => setIp(e.target.value)} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <select className="form-select" value={os} onChange={e => setOs(e.target.value as typeof os)}>
          <option value="linux">Linux</option>
          <option value="windows">Windows</option>
          <option value="synology">Synology</option>
        </select>
        <input className="form-input" placeholder="Distribution (ex: Debian 12)" value={distribution} onChange={e => setDistribution(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Type de déploiement</label>
        <select className="form-select" value={deploymentType} onChange={e => setDeploymentType(e.target.value as typeof deploymentType)}>
          <option value="">—</option>
          <option value="docker">Docker</option>
          <option value="proxmox">Proxmox</option>
          <option value="standalone">Standalone</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Accès</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <input className="form-input" placeholder="SSH" value={ssh} onChange={e => setSsh(e.target.value)} />
          <input className="form-input" placeholder="RDP" value={rdp} onChange={e => setRdp(e.target.value)} />
          <input className="form-input" placeholder="VPN" value={vpn} onChange={e => setVpn(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Sauvegardes</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {BACKUP_METHODS.map(method => (
            <button
              type="button"
              key={method}
              className={`fb ${backups.includes(method) ? 'active' : ''}`}
              onClick={() => toggleBackup(method)}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="state-error">{error}</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn-primary" disabled={submitting || !name.trim()}>
          {submitting ? 'Création…' : 'Créer le serveur'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  )
}
