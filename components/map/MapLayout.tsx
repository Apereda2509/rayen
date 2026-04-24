'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, List, X } from 'lucide-react'
import nextDynamic from 'next/dynamic'
import { MapLegend } from '@/components/map/MapLegend'
import type { UICNStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SightingFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    id: string
    speciesId: string
    slug: string
    commonName: string
    scientificName: string
    uicnStatus: string | null
    photoUrl: string | null
    observedAt: string | null
    observerName: string | null
  }
}

interface SpeciesEntry {
  slug: string
  commonName: string
  scientificName: string
  uicnStatus: string | null
  count: number
}

interface Props {
  sightings: SightingFeature[]
  speciesList: SpeciesEntry[]
  showProtectedAreas?: boolean
  selectedAreaSlugs?: string[]
}

const RayenMap = nextDynamic(
  () => import('@/components/map/RayenMap').then((m) => m.RayenMap),
  { ssr: false, loading: () => <MapSkeleton /> }
)

const UICN_STATUSES: UICNStatus[] = ['CR', 'EN', 'VU', 'NT', 'LC']

const UICN_HEX: Record<string, string> = {
  CR: '#D85A30',
  EN: '#D85A30',
  VU: '#F59E0B',
  NT: '#78716C',
  LC: '#00E676',
}

export function MapLayout({
  sightings,
  speciesList,
  showProtectedAreas = false,
  selectedAreaSlugs = [],
}: Props) {
  const [search, setSearch] = useState('')
  const [activeUicn, setActiveUicn] = useState<UICNStatus | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const filteredSpecies = useMemo(() => {
    let list = speciesList
    if (activeUicn) list = list.filter((s) => s.uicnStatus === activeUicn)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.commonName.toLowerCase().includes(q) ||
          s.scientificName.toLowerCase().includes(q)
      )
    }
    return list
  }, [speciesList, activeUicn, search])

  const filteredSightings = useMemo(() => {
    if (!activeUicn) return sightings
    return sightings.filter((s) => s.properties.uicnStatus === activeUicn)
  }, [sightings, activeUicn])

  function handleSpeciesClick(slug: string) {
    setSelectedSlug((prev) => (prev === slug ? null : slug))
    setIsDrawerOpen(false)
  }

  // ── Chips + list rendered in both desktop sidebar and mobile drawer ──

  const filterChips = (
    <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveUicn(null)}
          className={cn(
            'text-xs px-3 py-1 rounded-full transition-colors',
            !activeUicn
              ? 'bg-[#00E676] text-black font-medium'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          )}
        >
          Todos
        </button>
        {UICN_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveUicn(activeUicn === status ? null : status)}
            className={cn(
              'text-xs px-3 py-1 rounded-full transition-colors',
              activeUicn === status
                ? 'bg-[#00E676] text-black font-medium'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  )

  const speciesListEl = (
    <div className="flex-1 overflow-y-auto scroll-dark">
      {filteredSpecies.length === 0 ? (
        <p className="p-6 text-sm text-zinc-600 text-center">Sin resultados</p>
      ) : (
        <ul>
          {filteredSpecies.map((sp) => {
            const hex = UICN_HEX[sp.uicnStatus ?? ''] ?? '#666'
            const isSelected = selectedSlug === sp.slug
            return (
              <li key={sp.slug} className="border-b border-zinc-900">
                <button
                  onClick={() => handleSpeciesClick(sp.slug)}
                  className={cn(
                    'w-full text-left flex items-center gap-3 px-4 py-3 transition-colors',
                    isSelected
                      ? 'bg-zinc-800 border-l-2 border-[#00E676]'
                      : 'hover:bg-zinc-900'
                  )}
                >
                  <span
                    className="flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${hex}22`, color: hex }}
                  >
                    {sp.uicnStatus ?? '—'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-grotesk font-medium truncate">
                      {sp.commonName}
                    </p>
                    <p className="text-xs text-zinc-500 font-serif italic truncate">
                      {sp.scientificName}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-[#00E676] font-mono whitespace-nowrap">
                    {sp.count} {sp.count === 1 ? 'avistamiento' : 'avistamientos'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">

      {/* ── Desktop sidebar (320px) ──────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-80 flex-shrink-0 border-r border-zinc-800 bg-zinc-950">
        <div className="p-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="font-grotesk font-semibold text-white text-lg leading-tight">
            Avistamientos
          </h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            {speciesList.length} especies documentadas
          </p>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar especie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>
        </div>
        {filterChips}
        {speciesListEl}
      </aside>

      {/* ── Map column ───────────────────────────────────────── */}
      <div className="flex-1 relative" data-cursor="dark">
        <RayenMap
          sightings={filteredSightings as any}
          showProtectedAreas={showProtectedAreas}
          selectedAreaSlugs={selectedAreaSlugs}
          selectedSlug={selectedSlug}
        />

        <div className="absolute bottom-4 right-4 z-10">
          <MapLegend />
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="lg:hidden absolute bottom-6 left-4 z-10 flex items-center justify-center bg-[#00E676] text-black rounded-full p-3.5 shadow-lg"
          aria-label="Ver lista de especies"
        >
          <List className="h-5 w-5" />
        </button>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 rounded-t-2xl flex flex-col"
              style={{ height: '80vh' }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-800 flex-shrink-0">
                <div>
                  <h3 className="font-grotesk font-semibold text-white text-base">
                    Avistamientos
                  </h3>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {speciesList.length} especies documentadas
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar especie..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
              </div>
              {filterChips}
              {speciesListEl}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto rounded-full border-2 border-[#00E676] border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-zinc-400">Cargando mapa...</p>
      </div>
    </div>
  )
}
