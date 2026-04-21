import { cn } from '@/lib/utils'
import type { UICNStatus } from '@/lib/types'
import { UICN_LABELS } from '@/lib/types'

interface Props {
  status: UICNStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const STATUS_STYLES: Record<UICNStatus, string> = {
  EX:  'bg-stone-900  text-stone-100',
  EW:  'bg-pink-950   text-pink-100',
  CR:  'bg-red-100    text-red-800',
  EN:  'bg-orange-100 text-orange-800',
  VU:  'bg-amber-100  text-amber-800',
  NT:  'bg-lime-100   text-lime-800',
  LC:  'bg-emerald-100 text-emerald-800',
  DD:  'bg-stone-100  text-stone-600',
  NE:  'bg-stone-100  text-stone-500',
}

const SIZE_STYLES = {
  sm: 'text-xs px-2 py-0.5 rounded',
  md: 'text-xs font-medium px-2.5 py-1 rounded-md',
  lg: 'text-sm font-semibold px-3 py-1.5 rounded-lg',
}

export function ConservationBadge({
  status,
  size = 'md',
  showLabel = true,
  className,
}: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium whitespace-nowrap',
        STATUS_STYLES[status],
        SIZE_STYLES[size],
        className
      )}
      title={`Estado UICN: ${UICN_LABELS[status]}`}
    >
      <span className="font-bold">{status}</span>
      {showLabel && (
        <span className="opacity-80 font-normal">
          {UICN_LABELS[status]}
        </span>
      )}
    </span>
  )
}

// Versión compacta para el mapa (solo código)
export function StatusDot({ status }: { status: UICNStatus }) {
  const colors: Record<UICNStatus, string> = {
    EX:  '#1c1917',
    EW:  '#4B1528',
    CR:  '#D85A30',
    EN:  '#BA7517',
    VU:  '#EF9F27',
    NT:  '#639922',
    LC:  '#1D9E75',
    DD:  '#888780',
    NE:  '#D3D1C7',
  }

  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: colors[status] }}
      title={UICN_LABELS[status]}
    />
  )
}
