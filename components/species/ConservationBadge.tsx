import { cn } from '@/lib/utils'
import type { UICNStatus } from '@/lib/types'
import { UICN_LABELS } from '@/lib/types'

interface Props {
  status: UICNStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  /** Render with solid high-contrast styles for placement over photos */
  photoOverlay?: boolean
  className?: string
}

// For use in regular UI (cards info section, detail pages, lists)
const STATUS_STYLES: Record<UICNStatus, string> = {
  EX:  'bg-stone-900  text-stone-100',
  EW:  'bg-pink-950   text-pink-100',
  CR:  'bg-coral-400/20 text-coral-400',
  EN:  'bg-coral-400/15 text-coral-400',
  VU:  'bg-amber-100  text-amber-800',
  NT:  'bg-stone-100  text-stone-600',
  LC:  'bg-neon-400/15 text-neon-600',
  DD:  'bg-stone-100  text-stone-600',
  NE:  'bg-stone-100  text-stone-500',
}

// For use over photographs — solid backgrounds, always legible
const PHOTO_OVERLAY_STYLES: Record<UICNStatus, string> = {
  EX:  'bg-stone-900   text-white',
  EW:  'bg-pink-950    text-white',
  CR:  'bg-[#D85A30]   text-white',
  EN:  'bg-[#D85A30]/90 text-white',
  VU:  'bg-amber-500   text-black',
  NT:  'bg-zinc-600    text-white',
  LC:  'bg-[#00E676]   text-black',
  DD:  'bg-zinc-500    text-white',
  NE:  'bg-zinc-400    text-white',
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
  photoOverlay = false,
  className,
}: Props) {
  if (photoOverlay) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-semibold whitespace-nowrap',
          'text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-sm uppercase',
          PHOTO_OVERLAY_STYLES[status],
          className
        )}
        title={`Estado UICN: ${UICN_LABELS[status]}`}
      >
        {status}
        {showLabel && (
          <span className="font-normal normal-case opacity-90">
            {UICN_LABELS[status]}
          </span>
        )}
      </span>
    )
  }

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

export function StatusDot({ status }: { status: UICNStatus }) {
  const colors: Record<UICNStatus, string> = {
    EX:  '#1c1917',
    EW:  '#4B1528',
    CR:  '#D85A30',
    EN:  '#D85A30',
    VU:  '#F59E0B',
    NT:  '#78716C',
    LC:  '#00E676',
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
