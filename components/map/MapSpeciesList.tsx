import Link from 'next/link'
import { ConservationBadge } from '@/components/species/ConservationBadge'
import type { UICNStatus } from '@/lib/types'

interface SpeciesEntry {
  slug: string
  commonName: string
  uicnStatus: string | null
  count: number
}

interface Props {
  species: SpeciesEntry[]
}

export function MapSpeciesList({ species }: Props) {
  return (
    <div className="p-3">
      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        Especies en mapa ({species.length})
      </p>
      <ul className="space-y-1">
        {species.map((sp) => (
          <li key={sp.slug}>
            <Link
              href={`/especies/${sp.slug}`}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                {sp.uicnStatus ? (
                  <ConservationBadge
                    status={sp.uicnStatus as UICNStatus}
                    size="sm"
                  />
                ) : (
                  <span className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="text-xs text-zinc-300 group-hover:text-white truncate transition-colors">
                  {sp.commonName}
                </span>
              </div>
              <span className="text-[10px] text-zinc-600 flex-shrink-0 font-mono">
                {sp.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
