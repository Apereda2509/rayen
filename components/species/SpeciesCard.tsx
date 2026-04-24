import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { ConservationBadge } from './ConservationBadge'
import { SPECIES_TYPE_LABELS } from '@/lib/types'
import type { SpeciesSummary } from '@/lib/types'
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

export function SpeciesCard({ species, variant = 'card', className }: Props) {
  const {
    slug, commonName, scientificName, type,
    uicnStatus, isEndemic, primaryPhoto, photoCredit,
    regionCodes, verifiedSightings,
  } = species
  const photo = proxied(primaryPhoto)

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

  if (variant === 'list') {
    return (
      <Link
        href={`/especies/${slug}`}
        className={cn(
          'flex items-center gap-4 rounded-xl p-3 bg-white border border-stone-200',
          'hover:border-neon-400/40 hover:shadow-sm transition-all group',
          className
        )}
      >
        <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
          {photo ? (
            <img src={photo} alt={commonName} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-300">
              <MapPin className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-900 group-hover:text-neon-600 transition-colors truncate">
            {commonName}
          </h3>
          <p className="text-sm text-stone-500 italic truncate">{scientificName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {uicnStatus && <ConservationBadge status={uicnStatus} size="sm" showLabel={false} />}
            {isEndemic && (
              <span className="text-xs text-stone-500 font-medium">Endémica</span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Default: card
  return (
    <Link
      href={`/especies/${slug}`}
      className={cn(
        'group rounded-2xl overflow-hidden bg-white border border-stone-200',
        'hover:border-neon-400/40 hover:shadow-md transition-all',
        className
      )}
    >
      <div className="relative h-48 w-full bg-stone-100">
        {photo ? (
          <>
            <img
              src={photo}
              alt={commonName}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            {photoCredit && (
              <span className="absolute bottom-1 right-2 text-[10px] text-white/70">
                © {photoCredit}
              </span>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300">
            <MapPin className="h-12 w-12" />
          </div>
        )}

        {uicnStatus && (
          <div className="absolute top-2 left-2">
            <ConservationBadge status={uicnStatus} photoOverlay showLabel={false} />
          </div>
        )}

        {isEndemic && (
          <div className="absolute top-2 right-2">
            <span className="text-xs font-medium bg-carbon-900 text-white px-2 py-0.5 rounded">
              Endémica
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1">
          <h3 className="font-semibold text-stone-900 group-hover:text-neon-600 transition-colors leading-snug">
            {commonName}
          </h3>
          <p className="text-sm text-stone-500 italic">{scientificName}</p>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-stone-500">
          <span className="bg-stone-100 px-2 py-0.5 rounded">
            {SPECIES_TYPE_LABELS[type]}
          </span>

          {regionCodes?.length && (
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {regionCodes.length === 1 ? regionCodes[0] : `${regionCodes.length} regiones`}
            </span>
          )}
        </div>

        {verifiedSightings > 0 && (
          <p className="mt-2 text-xs text-neon-600">
            {verifiedSightings} avistamiento{verifiedSightings !== 1 ? 's' : ''} verificado{verifiedSightings !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </Link>
  )
}
