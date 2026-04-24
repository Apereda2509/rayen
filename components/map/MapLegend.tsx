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
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-stone-200 p-3 text-xs">
      <h4 className="font-semibold text-stone-700 mb-2">Estado de conservación</h4>
      <div className="space-y-1">
        {ITEMS.map(({ status, color }) => (
          <div key={status} className="flex items-center gap-2 text-stone-600">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium">{status}</span>
            <span className="text-stone-500">— {UICN_LABELS[status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
