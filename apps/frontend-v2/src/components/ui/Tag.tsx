interface TagProps {
  label: string
  variant?: 'os' | 'pve' | 'vps' | 'fw'
}

export default function Tag({ label, variant = 'os' }: TagProps) {
  return <span className={`tag tag-${variant}`}>{label}</span>
}
