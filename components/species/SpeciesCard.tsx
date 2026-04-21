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

export function SpeciesCard({ species, variant = 'card', className }: Props) {
  const {
    slug, commonName, scientificName, type,
    uicnStatus, isEndemic, primaryPhoto, photoCredit,
    regionCodes, verifiedSightings,
  } = species

  if (variant === 'map-popup') {
    return (
      <div className={cn('w-64 rounded-xl overflow-hidden bg-white shadow-lg', className)}>
        {primaryPhoto && (
          <div className="relative h-32 w-full bg-emerald-50">
            <img
              src={primaryPhoto}
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
              <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded">
                Endémica
              </span>
            )}
          </div>
          <Link
            href={`/especies/${slug}`}
            className="mt-3 block w-full text-center rounded-lg bg-teal-600 hover:bg-teal-500 px-3 py-1.5 text-xs font-medium text-white transition-colors"
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
          'hover:border-teal-300 hover:shadow-sm transition-all group',
          className
        )}
      >
        {/* Foto */}
        <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-emerald-50">
          {primaryPhoto ? (
            <img src={primaryPhoto} alt={commonName} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl text-stone-300">
              {typeEmoji(type)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-900 group-hover:text-teal-700 transition-colors truncate">
            {commonName}
          </h3>
          <p className="text-sm text-stone-500 italic truncate">{scientificName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {uicnStatus && <ConservationBadge status={uicnStatus} size="sm" showLabel={false} />}
            {isEndemic && (
              <span className="text-xs text-teal-600 font-medium">Endémica</span>
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
        'hover:border-teal-300 hover:shadow-md transition-all',
        className
      )}
    >
      {/* Imagen */}
      <div className="relative h-48 w-full bg-emerald-50">
        {primaryPhoto ? (
          <>
            <img
              src={primaryPhoto}
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
          <div className="flex h-full items-center justify-center text-5xl text-stone-200">
            {typeEmoji(type)}
          </div>
        )}

        {/* Badge estado */}
        {uicnStatus && (
          <div className="absolute top-2 left-2">
            <ConservationBadge status={uicnStatus} size="sm" />
          </div>
        )}

        {/* Badge endémica */}
        {isEndemic && (
          <div className="absolute top-2 right-2">
            <span className="text-xs font-medium bg-teal-600 text-white px-2 py-0.5 rounded">
              Endémica
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="mb-1">
          <h3 className="font-semibold text-stone-900 group-hover:text-teal-700 transition-colors leading-snug">
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
          <p className="mt-2 text-xs text-teal-600">
            {verifiedSightings} avistamiento{verifiedSightings !== 1 ? 's' : ''} verificado{verifiedSightings !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </Link>
  )
}

function typeEmoji(type: string): string {
  const map: Record<string, string> = {
    mamifero: '🦙', ave: '🦅', reptil: '🦎',
    anfibio: '🐸', pez: '🐟', insecto: '🪲',
    planta: '🌿', hongo: '🍄', alga: '🌊', otro: '🌱',
  }
  return map[type] ?? '🌿'
}
