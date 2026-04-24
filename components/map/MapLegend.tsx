import { UICN_LABELS } from '@/lib/types'
import type { UICNStatus } from '@/lib/types'

const ITEMS: { status: UICNStatus; color: string }[] = [
  { status: 'CR', color: '#D85A30' },
  { status: 'EN', color: '#D85A30' },
  { status: 'VU', color: '#F59E0B' },
  { status: 'NT', color: '#78716C' },
  { status: 'LC', color: '#00E676' },
]

export function MapLegend() {
  return (
    <div className="bg-zinc-900/95 backdrop-blur-sm rounded-xl shadow-xl border border-zinc-800 p-3 text-xs">
      <h4 className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Estado UICN</h4>
      <div className="space-y-1.5">
        {ITEMS.map(({ status, color }) => (
          <div key={status} className="flex items-center gap-2 text-zinc-400">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="font-grotesk font-semibold text-zinc-300">{status}</span>
            <span className="text-zinc-500">— {UICN_LABELS[status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
