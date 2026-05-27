interface ProgressBarProps {
  value: number
}

function barColor(v: number) {
  return v > 85 ? '#ef4444' : v > 65 ? '#f59e0b' : '#22c55e'
}

export default function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="prog-bar">
      <div className="prog-fill" style={{ width: `${value}%`, background: barColor(value) }} />
    </div>
  )
}
