import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconServer, IconWall } from '@tabler/icons-react'
import type { Network, VM } from '../types'

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:  '#22c55e',
  SHUTOFF: '#555555',
  ERROR:   '#ef4444',
}
function statusColor(s: string) { return STATUS_COLOR[s] ?? '#f59e0b' }

const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#ef4444', '#a855f7', '#06b6d4', '#f59e0b', '#ec4899']

const LEFT_W     = 182   // name column width (px)
const RIGHT_W    = 165   // CIDRs column width (px)
const BASE_ROW_H = 56    // network row height (header zone)
const LINE_Y     = 28    // Y of the horizontal line within the row
const TRUNK_X    = 278   // absolute X of vertical trunk (from container left)
// TRUNK_X must be > LEFT_W (182). Trunk offset within line area = TRUNK_X - LEFT_W = 96px

const VM_DROP    = 30    // drop line height (line → VM box)
const VM_BOX_H   = 62   // VM box approximate height
const VM_SPACING = 108   // horizontal spacing between VMs (within line area)
const VM_START_X = 24    // first VM left offset within line area

export default function NetworkTopology({ networks, vms }: { networks: Network[]; vms: VM[] }) {
  if (!networks.length) return null

  const vmByName = Object.fromEntries(vms.map(v => [v.name, v]))

  // VMs présents sur 2+ réseaux = gateways/firewalls
  const allNames = networks.flatMap(n => n.connected_vms.map(v => v.name))
  const gatewayVms = new Set(allNames.filter((name, _, arr) => arr.filter(n => n === name).length > 1))

  const sorted = [...networks].sort((a, b) => {
    if (a.is_external !== b.is_external) return a.is_external ? -1 : 1
    return 0
  })

  return (
    <div style={{ overflowX: 'auto', minWidth: 500, padding: '14px 4px 10px' }}>
      {sorted.map((net, i) => {
        const color      = COLORS[i % COLORS.length]
        const isLast     = i === sorted.length - 1
        const next       = sorted[i + 1]
        const hasVMs     = net.connected_vms.length > 0
        const showRouter = !isLast && (net.has_router || (next?.has_router ?? false))

        return (
          <div key={net.id}>
            <NetRow net={net} color={color} hasVMs={hasVMs} vmByName={vmByName} gatewayVms={gatewayVms} />
            {!isLast && <ConnectorRow showRouter={showRouter} />}
          </div>
        )
      })}
    </div>
  )
}

/* ── Network row ────────────────────────────────────────────────── */

const SUBNET_FOLD = 3

function NetRow({ net, color, hasVMs, vmByName, gatewayVms }: { net: Network; color: string; hasVMs: boolean; vmByName: Record<string, VM>; gatewayVms: Set<string> }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const rowH = BASE_ROW_H + (hasVMs ? VM_DROP + VM_BOX_H + 8 : 0)
  const foldable = net.subnets.length > SUBNET_FOLD
  const visibleSubnets = foldable && !expanded ? net.subnets.slice(0, SUBNET_FOLD) : net.subnets

  return (
    <div style={{ display: 'flex', height: rowH, position: 'relative' }}>

      {/* Left: name + description */}
      <div style={{ width: LEFT_W, flexShrink: 0, paddingRight: 10, paddingTop: 10 }}>
        <div style={{
          color, fontWeight: 700, fontSize: 13, lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {net.name}
        </div>
        <div style={{ color: '#777', fontSize: 9.5, marginTop: 3, lineHeight: 1.5 }}>
          {net.is_external ? 'Réseau externe' : 'Réseau privé interne'}
          {hasVMs && !net.is_external && <><br />(contenant les instances)</>}
        </div>
      </div>

      {/* Center: line area (flex 1) */}
      <div style={{ flex: 1, position: 'relative' }}>

        {/* Horizontal colored line */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          top: LINE_Y,
          height: 3,
          background: color,
          transform: 'translateY(-50%)',
        }} />

        {/* Trunk intersection dot */}
        <div style={{
          position: 'absolute',
          left: TRUNK_X - LEFT_W,
          top: LINE_Y,
          width: 11, height: 11,
          borderRadius: '50%',
          background: '#181b20',
          border: `2.5px solid ${color}`,
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }} />

        {/* VM drop lines + boxes */}
        {hasVMs && net.connected_vms.map((vm, j) => {
          const vmLeft = VM_START_X + j * VM_SPACING
          const vmObj    = vmByName[vm.name]
          const sc       = vmObj ? statusColor(vmObj.status) : '#555'
          const isGw     = gatewayVms.has(vm.name)
          const gwColor  = '#f59e0b'
          return (
            <div key={vm.name} style={{
              position: 'absolute',
              left: vmLeft,
              top: LINE_Y,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              {/* Drop line */}
              <div style={{ width: 2, height: VM_DROP + 2, background: color, opacity: 0.45 }} />
              {/* VM box */}
              <div
                onClick={() => vmObj && navigate(`/resources/${vmObj.id}`)}
                style={{
                  background: isGw ? '#1c1a10' : '#181b20',
                  border: `1.5px solid ${isGw ? gwColor : color + '55'}`,
                  borderRadius: 7,
                  padding: '6px 12px',
                  textAlign: 'center',
                  minWidth: 88,
                  cursor: vmObj ? 'pointer' : 'default',
                }}
              >
                {isGw
                  ? <IconWall size={15} color={gwColor} />
                  : <IconServer size={15} color={sc} />
                }
                <div style={{
                  color: '#d0d0d0', fontSize: 9.5, fontWeight: 600,
                  marginTop: 4, lineHeight: 1.2,
                  maxWidth: 84, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {vm.name}
                </div>
                {vm.ip && (
                  <div style={{
                    marginTop: 3, fontSize: 8,
                    color: '#888', fontFamily: 'monospace', lineHeight: 1.3,
                  }}>
                    {vm.ip}
                  </div>
                )}
                <div style={{ marginTop: 3, fontSize: 8, fontWeight: 600, letterSpacing: '0.03em',
                  color: isGw ? gwColor : sc }}>
                  {isGw ? 'GATEWAY' : vmObj?.status}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right: subnet CIDRs */}
      <div style={{ width: RIGHT_W, flexShrink: 0, paddingLeft: 10, paddingTop: 10, textAlign: 'right' }}>
        {net.subnets.length === 0 ? (
          <span style={{ color: '#444', fontSize: 9 }}>—</span>
        ) : (
          <>
            {visibleSubnets.map(s => (
              <div key={s.id} style={{ color: '#666', fontSize: 9, fontFamily: 'monospace', lineHeight: 1.75 }}>
                — {s.cidr}
              </div>
            ))}
            {foldable && (
              <div
                onClick={() => setExpanded(v => !v)}
                style={{ color: '#555', fontSize: 9, marginTop: 3, cursor: 'pointer', userSelect: 'none' }}
              >
                {expanded ? '▲ réduire' : `+${net.subnets.length - SUBNET_FOLD} subnets`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── Vertical connector between two networks ────────────────────── */

function ConnectorRow({ showRouter }: { showRouter: boolean }) {
  return (
    <div style={{ position: 'relative', height: 62 }}>

      {/* Vertical trunk line */}
      <div style={{
        position: 'absolute',
        left: TRUNK_X,
        top: 0, bottom: 0,
        width: 2,
        background: '#363c4a',
        transform: 'translateX(-50%)',
        zIndex: 0,
      }} />

      {/* Router / Firewall box */}
      {showRouter && (
        <div style={{
          position: 'absolute',
          left: TRUNK_X,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#1c2028',
          border: '1.5px solid #484f62',
          borderRadius: 7,
          padding: '5px 14px',
          textAlign: 'center',
          zIndex: 3,
          minWidth: 78,
          boxShadow: '0 2px 8px #0005',
        }}>
          <div style={{ fontSize: 13, lineHeight: 1 }}>🔀</div>
          <div style={{ fontSize: 9.5, color: '#c0c0c0', fontWeight: 600, marginTop: 3, lineHeight: 1.2 }}>
            Routeur
          </div>
          <div style={{ fontSize: 8.5, color: '#666', lineHeight: 1.3 }}>/ Firewall</div>
        </div>
      )}
    </div>
  )
}
