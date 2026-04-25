import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { ConservationBadge } from './ConservationBadge'
import { SPECIES_TYPE_LABELS } from '@/lib/types'
import type { SpeciesSummary, UICNStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  species: SpeciesSummary
  variant?: 'card' | 'list' | 'map-popup'
  className?: string
}

function proxied(url: string | null | undefined): string | null | undefined {
  if (!url) return url
  if (url.includes('wikimedia.org')) return `/api/img?url=${encodeURIComponent(url)}`
  return url
}

function uicnBadgeClass(status: UICNStatus): string {
  switch (status) {
    case 'CR': return 'bg-red-900/80 text-red-300'
    case 'EN': return 'bg-orange-900/80 text-orange-300'
    case 'VU': return 'bg-yellow-900/80 text-yellow-300'
    default:   return 'bg-zinc-700/80 text-zinc-300'
  }
}

export function SpeciesCard({ species, variant = 'card', className }: Props) {
  const {
    slug, commonName, scientificName, type,
    uicnStatus, isEndemic, primaryPhoto,
    regionCodes, verifiedSightings,
  } = species
  const photo = proxied(primaryPhoto)

  // MAP-POPUP — sin cambios
  if (variant === 'map-popup') {
    return (
      <div className={cn('w-64 rounded-xl overflow-hidden bg-white shadow-lg', className)}>
        {photo && (
          <div className="relative h-32 w-full bg-stone-100">
            <img
              src={photo}
              alt={commonName}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-semibold text-stone-900 leading-tight">{commonName}</h3>
              <p className="text-xs text-stone-500 italic">{scientificName}</p>
            </div>
            {uicnStatus && (
              <ConservationBadge status={uicnStatus} size="sm" showLabel={false} />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
              {SPECIES_TYPE_LABELS[type]}
            </span>
            {isEndemic && (
              <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                Endémica
              </span>
            )}
          </div>
          <Link
            href={`/especies/${slug}`}
            className="mt-3 block w-full text-center rounded-lg bg-neon-400 hover:bg-neon-300 px-3 py-1.5 text-xs font-medium text-black transition-colors"
          >
            Ver ficha completa
          </Link>
        </div>
      </div>
    )
  }

  // LIST — estilo oscuro
  if (variant === 'list') {
    return (
      <Link
        href={`/especies/${slug}`}
        className={cn(
          'flex items-center gap-4 rounded-xl p-3 bg-zinc-900 border border-zinc-800',
          'hover:border-zinc-700 transition-all group',
          className
        )}
      >
        <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
          {photo ? (
            <img
              src={photo}
              alt={commonName}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-600">
              <MapPin className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white group-hover:text-[#00E676] transition-colors truncate">
            {commonName}
          </h3>
          <p className="text-sm text-zinc-500 italic truncate">{scientificName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {uicnStatus && <ConservationBadge status={uicnStatus} size="sm" showLabel={false} />}
            {isEndemic && (
              <span className="text-xs text-zinc-400 font-medium">Endémica</span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // CARD — rediseño editorial oscuro
  return (
    <Link href={`/especies/${slug}`} className={cn('group block', className)}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group-hover:border-zinc-700 group-hover:scale-[1.02] transition-all duration-300 cursor-pointer">
        {/* Bloque imagen */}
        <div className="relative aspect-video w-full overflow-hidden">
          {photo ? (
            <img
              src={photo}
              alt={commonName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <MapPin className="h-10 w-10 text-zinc-700" />
            </div>
          )}

          {/* Overlay degradado */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent" />

          {/* Tipo — esquina sup izq */}
          <span className="absolute top-3 left-3 bg-black/60 text-zinc-300 text-[10px] rounded-full px-2.5 py-1 backdrop-blur-sm">
            {SPECIES_TYPE_LABELS[type]}
          </span>

          {/* Endémica — esquina sup der */}
          {isEndemic && (
            <span className="absolute top-3 right-3 bg-[#00E676] text-black text-[10px] font-semibold rounded-full px-2.5 py-1">
              Endémica
            </span>
          )}

          {/* UICN — esquina inf izq */}
          {uicnStatus && (
            <span className={`absolute bottom-3 left-3 text-[10px] font-medium rounded-full px-2.5 py-1 ${uicnBadgeClass(uicnStatus)}`}>
              {uicnStatus}
            </span>
          )}
        </div>

        {/* Bloque contenido */}
        <div className="p-4 flex flex-col gap-1">
          <h3 className="font-grotesk font-semibold text-white text-base line-clamp-1">
            {commonName}
          </h3>
          <p className="text-zinc-500 text-xs italic">{scientificName}</p>
          {verifiedSightings > 0 && (
            <p className="text-[#00E676] text-xs mt-1">
              {verifiedSightings} avistamiento{verifiedSightings !== 1 ? 's' : ''} verificado{verifiedSightings !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
