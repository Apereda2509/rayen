'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

interface Observer {
  id: string
  name: string
  username: string | null
  avatar_url: string | null
  region_code: string | null
  sightings_count: number
  unique_species: number
  top_region: string | null
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

export function ObservadoresFeed() {
  const [observers, setObservers] = useState<Observer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/comunidad/observadores')
      .then((r) => r.json())
      .then((d) => setObservers(d.observers ?? []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E676]" />
      </div>
    )
  }

  return (
    <div>
      {observers.length > 0 && observers.length < 5 && (
        <p className="text-zinc-500 text-sm mb-5">
          Rayen crece con cada observador que se suma.
        </p>
      )}

      {observers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-zinc-400 text-sm mb-1">Aún no hay observadores registrados.</p>
          <p className="text-zinc-500 text-xs">Rayen crece con cada observador que se suma.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-800 rounded-2xl border border-zinc-800 overflow-hidden">
          {observers.map((obs, idx) => {
            const href = obs.username ? `/perfil/${obs.username}` : '#'
            const topRegionName = obs.top_region ? (REGION_NAMES[obs.top_region] ?? obs.top_region) : null

            return (
              <Link
                key={obs.id}
                href={href}
                className="flex items-center gap-4 px-4 py-3.5 bg-zinc-950 hover:bg-zinc-900 transition-colors"
              >
                {/* Posición */}
                <span className="w-6 text-center text-sm font-bold text-zinc-600 flex-shrink-0">
                  {idx + 1}
                </span>

                {/* Avatar */}
                {obs.avatar_url ? (
                  <Image
                    src={obs.avatar_url}
                    alt={obs.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-zinc-500 text-sm font-medium">
                      {obs.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{obs.name}</p>
                  <p className="text-zinc-500 text-xs truncate">
                    {obs.username ? `@${obs.username}` : ''}
                    {obs.username && topRegionName ? ' · ' : ''}
                    {topRegionName}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 flex-shrink-0 text-right">
                  <div>
                    <p className="text-white text-sm font-semibold">{obs.sightings_count}</p>
                    <p className="text-zinc-600 text-[11px]">avistamientos</p>
                  </div>
                  <div>
                    <p className="text-[#00E676] text-sm font-semibold">{obs.unique_species}</p>
                    <p className="text-zinc-600 text-[11px]">especies</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
