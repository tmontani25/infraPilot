interface RingGaugeProps {
  pct: number
  color?: string
  size?: number
}

export default function RingGauge({ pct, color = '#e8690a', size = 38 }: RingGaugeProps) {
  const r = 15
  const circ = 2 * Math.PI * r
  const dash = (pct / 100 * circ).toFixed(1)
  const gap = (circ - pct / 100 * circ).toFixed(1)

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#252830" strokeWidth="3" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" />
      </svg>
      <div className="pct">{pct}%</div>
    </div>
  )
}
