'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AreaMultiSelect } from '@/components/ui/AreaMultiSelect'

const REGION_NAMES: Record<string, string> = {
  AP: 'Arica y Parinacota', TA: 'Tarapacá', AN: 'Antofagasta',
  AT: 'Atacama', CO: 'Coquimbo', VA: 'Valparaíso', RM: 'Metropolitana',
  LI: "O'Higgins", ML: 'Maule', NB: 'Ñuble', BI: 'Biobío',
  AR: 'La Araucanía', LR: 'Los Ríos', LL: 'Los Lagos',
  AI: 'Aysén', MA: 'Magallanes',
}

interface Sighting {
  id: string
  lat: number
  lng: number
  observedAt: string
  regionCode: string | null
  notes: string | null
}

interface Props {
  slug: string
  regionCodes: string[]
}

export function SpeciesSightingsSection({ slug, regionCodes }: Props) {
  const [sightings, setSightings] = useState<Sighting[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set())
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set())
  const [showAreaFilter, setShowAreaFilter] = useState(false)

  const fetchSightings = useCallback(async (
    from: string,
    to: string,
    regions: Set<string>,
    areaSlug: string,
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (from) params.set('dateFrom', from)
      if (to) params.set('dateTo', to)
      regions.forEach(r => params.append('region', r))
      if (areaSlug) params.set('area', areaSlug)
      const res = await fetch(`/api/species/${slug}/sightings?${params}`)
      const json = await res.json()
      setSightings(json.data ?? [])
    } catch {
      setSightings([])
    } finally {
      setLoading(false)
    }
  }, [slug])

  // Área seleccionada es solo una (la primera del set) — se envía como filtro único
  const currentArea = selectedAreas.size > 0 ? [...selectedAreas][0] : ''

  useEffect(() => { fetchSightings('', '', new Set(), '') }, [fetchSightings])

  const handleDateFrom = (v: string) => {
    setDateFrom(v)
    fetchSightings(v, dateTo, selectedRegions, currentArea)
  }
  const handleDateTo = (v: string) => {
    setDateTo(v)
    fetchSightings(dateFrom, v, selectedRegions, currentArea)
  }

  const toggleRegion = (code: string) => {
    const next = new Set(selectedRegions)
    next.has(code) ? next.delete(code) : next.add(code)
    setSelectedRegions(next)
    fetchSightings(dateFrom, dateTo, next, currentArea)
  }

  const toggleArea = (slug: string) => {
    // Solo una área a la vez para la consulta (puede extenderse a varias)
    const next = new Set(selectedAreas)
    if (next.has(slug)) {
      next.delete(slug)
    } else {
      next.clear()
      next.add(slug)
    }
    setSelectedAreas(next)
    const area = next.size > 0 ? [...next][0] : ''
    fetchSightings(dateFrom, dateTo, selectedRegions, area)
  }

  const clearFilters = () => {
    setDateFrom(''); setDateTo('')
    setSelectedRegions(new Set())
    setSelectedAreas(new Set())
    fetchSightings('', '', new Set(), '')
  }

  const hasFilters = dateFrom || dateTo || selectedRegions.size > 0 || selectedAreas.size > 0

  return (
    <div>
      {/* Filtros */}
      <div className="mb-4 space-y-3">

        {/* Regiones — multiselección */}
        {regionCodes.length > 0 && (
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Filtrar por región</p>
            <div className="flex flex-wrap gap-1.5">
              {regionCodes.map((code) => (
                <button
                  key={code}
                  onClick={() => toggleRegion(code)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border transition-colors',
                    selectedRegions.has(code)
                      ? 'bg-neon-400 text-black border-neon-400'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-neon-400/40'
                  )}
                >
                  {REGION_NAMES[code] ?? code}
                </button>
              ))}
            </div>
            {selectedRegions.size > 1 && (
              <p className="text-[10px] text-neon-600 mt-1">
                {selectedRegions.size} regiones seleccionadas
              </p>
            )}
          </div>
        )}

        {/* Área protegida */}
        <div>
          <button
            onClick={() => setShowAreaFilter(v => !v)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5',
              showAreaFilter || selectedAreas.size > 0
                ? 'border-neon-400/40 bg-stone-50 text-stone-700'
                : 'border-stone-200 text-stone-500 hover:border-stone-300'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-neon-400 opacity-70 flex-shrink-0" />
            Área protegida
            {selectedAreas.size > 0 && (
              <span className="ml-1 bg-neon-400 text-black rounded-full text-[9px] px-1.5 py-0.5">
                {selectedAreas.size}
              </span>
            )}
          </button>
          {showAreaFilter && (
            <div className="mt-2 rounded-lg border border-stone-200 bg-stone-50 p-3">
              <AreaMultiSelect
                selected={selectedAreas}
                onChange={toggleArea}
                maxHeight="9rem"
              />
            </div>
          )}
        </div>

        {/* Rango de fechas */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-stone-400 block mb-1">Desde</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => handleDateFrom(e.target.value)}
              className="text-xs rounded-md border border-stone-200 px-2 py-1.5 text-stone-700 focus:border-neon-400 focus:outline-none focus:ring-1 focus:ring-neon-400"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 block mb-1">Hasta</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => handleDateTo(e.target.value)}
              className="text-xs rounded-md border border-stone-200 px-2 py-1.5 text-stone-700 focus:border-neon-400 focus:outline-none focus:ring-1 focus:ring-neon-400"
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 pb-1.5 transition-colors"
            >
              <X className="h-3 w-3" /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de avistamientos */}
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-stone-400">
          <div className="h-4 w-4 rounded-full border-2 border-neon-400 border-t-transparent animate-spin" />
          Cargando avistamientos…
        </div>
      ) : sightings.length === 0 ? (
        <p className="text-sm text-stone-400 py-4">
          {hasFilters ? 'Sin avistamientos para los filtros seleccionados.' : 'Sin avistamientos verificados registrados.'}
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-stone-400 mb-3">
            {sightings.length} avistamiento{sightings.length !== 1 ? 's' : ''} verificado{sightings.length !== 1 ? 's' : ''}
          </p>
          {sightings.map((s) => (
            <div key={s.id} className="flex items-start gap-3 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2.5">
              <MapPin className="h-3.5 w-3.5 text-neon-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {s.regionCode && (
                    <span className="text-xs font-medium text-stone-600">
                      {REGION_NAMES[s.regionCode] ?? s.regionCode}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-stone-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(s.observedAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs text-stone-300">
                    {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                  </span>
                </div>
                {s.notes && (
                  <p className="text-xs text-stone-500 mt-0.5 truncate">{s.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
