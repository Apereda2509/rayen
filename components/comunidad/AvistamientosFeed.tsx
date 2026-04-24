'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { ConservationBadge } from '@/components/species/ConservationBadge'
import type { UICNStatus } from '@/lib/types'

interface Avistamiento {
  id: string
  observed_at: string
  region_code: string | null
  photo_url: string | null
  notes: string | null
  verified: boolean
  species_slug: string
  species_common_name: string
  species_scientific_name: string
  species_uicn_status: string | null
  user_name: string | null
  user_username: string | null
  user_avatar: string | null
}

const REGION_NAMES: Record<string, string> = {
  // Códigos ISO actuales
  AP: 'Arica y Parinacota', TA: 'Tarapacá', AN: 'Antofagasta', AT: 'Atacama',
  CO: 'Coquimbo', VA: 'Valparaíso', RM: 'Metropolitana', OH: "O'Higgins",
  MA: 'Maule', NB: 'Ñuble', BI: 'Biobío', AR: 'La Araucanía',
  LR: 'Los Ríos', LL: 'Los Lagos', AI: 'Aysén', MG: 'Magallanes',
  // Códigos numéricos romanos (legacy)
  XV: 'Arica y Parinacota', I: 'Tarapacá', II: 'Antofagasta', III: 'Atacama',
  IV: 'Coquimbo', V: 'Valparaíso', VI: "O'Higgins",
  VII: 'Maule', XVI: 'Ñuble', VIII: 'Biobío', IX: 'La Araucanía',
  XIV: 'Los Ríos', X: 'Los Lagos', XI: 'Aysén', XII: 'Magallanes',
}

export function AvistamientosFeed() {
  const [sightings, setSightings] = useState<Avistamiento[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchSightings = useCallback(async (p: number, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const res = await fetch(`/api/comunidad/avistamientos?page=${p}`)
      const data = await res.json()
      const incoming: Avistamiento[] = data.sightings ?? []
      setSightings((prev) => append ? [...prev, ...incoming] : incoming)
      setHasMore(data.hasMore)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { fetchSightings(1, false) }, [fetchSightings])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchSightings(next, true)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E676]" />
      </div>
    )
  }

  if (sightings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-zinc-400 text-base mb-1">Aún no hay avistamientos.</p>
        <p className="text-zinc-500 text-sm mb-6">Sé el primero en reportar una especie.</p>
        <Link
          href="/avistamientos/nuevo"
          className="rounded-lg bg-[#00E676] hover:bg-[#00c85e] px-5 py-2.5 text-sm font-semibold text-black transition-colors"
        >
          Reportar avistamiento
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sightings.map((s) => (
          <Link
            key={s.id}
            href={`/especies/${s.species_slug}`}
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
          >
            {/* Imagen o fondo vacío */}
            <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
              {s.photo_url ? (
                <Image
                  src={s.photo_url}
                  alt={s.species_common_name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <span className="text-zinc-600 text-sm font-medium leading-snug">
                    {s.species_common_name}
                  </span>
                </div>
              )}

              {/* Badge UICN */}
              {s.species_uicn_status && (
                <div className="absolute top-2 left-2 z-10">
                  <ConservationBadge
                    status={s.species_uicn_status as UICNStatus}
                    photoOverlay
                    showLabel={false}
                  />
                </div>
              )}

              {/* Overlay con info del observador */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5 flex items-center gap-2">
                {s.user_avatar ? (
                  <Image
                    src={s.user_avatar}
                    alt={s.user_name ?? ''}
                    width={24}
                    height={24}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-700 flex-shrink-0" />
                )}
                <span className="text-white/80 text-xs truncate">
                  {s.user_username ? `@${s.user_username}` : (s.user_name ?? 'Anónimo')}
                </span>
              </div>
            </div>

            {/* Info de la especie */}
            <div className="px-3 py-3 flex-1">
              <p className="text-white text-sm font-semibold leading-tight truncate">
                {s.species_common_name}
              </p>
              <p className="text-zinc-400 text-xs italic truncate mt-0.5">
                {s.species_scientific_name}
              </p>
              <div className="flex items-center gap-2 mt-2 text-zinc-500 text-xs">
                {s.region_code && (
                  <span>{REGION_NAMES[s.region_code] ?? s.region_code}</span>
                )}
                {s.region_code && s.observed_at && <span>·</span>}
                {s.observed_at && (
                  <span>
                    {new Date(s.observed_at).toLocaleDateString('es-CL', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors disabled:opacity-50"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            Cargar más
          </button>
        </div>
      )}
    </div>
  )
}
