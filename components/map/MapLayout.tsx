'use client'

import { useState, useMemo, useCallback, useEffect, Component } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Search, List, X, MapPin, TreePine, Shield, Star } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import Link from 'next/link'
import { MapLegend } from '@/components/map/MapLegend'
import { AreaMultiSelect } from '@/components/ui/AreaMultiSelect'
import { SPECIES_TYPE_LABELS, UICN_LABELS, type SpeciesType, type UICNStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import type { SpeciesClickInfo, AreaClickInfo } from '@/components/map/RayenMap'

// ── Dynamic map import ───────────────────────────────────────
const RayenMap = nextDynamic(
  () => import('@/components/map/RayenMap').then((m) => m.RayenMap),
  { ssr: false, loading: () => <MapSkeleton /> }
)

// ── Constants ────────────────────────────────────────────────
const UICN_STATUSES: UICNStatus[] = ['CR', 'EN', 'VU', 'NT', 'LC']

const UICN_HEX: Record<string, string> = {
  CR: '#D85A30', EN: '#D85A30', VU: '#F59E0B', NT: '#78716C', LC: '#00E676',
}

const UICN_COLORS: Record<string, string> = {
  CR: '#D85A30', EN: '#D85A30', VU: '#F59E0B', NT: '#78716C', LC: '#00E676', DD: '#888780',
}

const SPECIES_TYPES: SpeciesType[] = ['mamifero', 'ave', 'planta', 'anfibio', 'reptil', 'pez', 'insecto', 'hongo']

const ECOSYSTEMS = [
  { slug: 'desierto_atacama',         label: 'Atacama' },
  { slug: 'altiplano',                label: 'Altiplano' },
  { slug: 'matorral_esclerofilo',     label: 'Matorral central' },
  { slug: 'bosque_valdiviano',        label: 'Bosque valdiviano' },
  { slug: 'bosque_andino_patagonico', label: 'Patagonia' },
  { slug: 'litoral_rocoso',           label: 'Litoral' },
  { slug: 'humedales',                label: 'Humedales' },
]

const SNASPE_TIPOS: { value: string | null; label: string }[] = [
  { value: null,           label: 'Todos' },
  { value: 'Parques',      label: 'Parques' },
  { value: 'Reservas',     label: 'Reservas' },
  { value: 'Monumentos',   label: 'Monumentos' },
  { value: '__sin_tipo__', label: 'Sin clasificar' },
]

const REGION_LABELS: [string, string][] = [
  ['DE TARAPACA',                       'Tarapacá'],
  ['DE ANTOFAGASTA',                    'Antofagasta'],
  ['DE ATACAMA',                        'Atacama'],
  ['DE COQUIMBO',                       'Coquimbo'],
  ['DE VALPARAISO',                     'Valparaíso'],
  ['METROPOLITANA',                     'Metropolitana'],
  ['DEL LIBERTADOR B OHIGGINS',         "O'Higgins"],
  ['DEL MAULE',                         'Maule'],
  ['DEL BIO-BIO',                       'Biobío'],
  ['DE LA ARAUCANIA',                   'La Araucanía'],
  ['DE LOS LAGOS',                      'Los Lagos'],
  ['DE AISEN',                          'Aysén'],
  ['DE MAGALLANES y ANTARTICA CHILENA', 'Magallanes'],
]

// Maps SNASPE region string → region codes used in sightings
const SNASPE_TO_CODES: Record<string, string[]> = {
  'DE TARAPACA':                       ['I', 'XV'],
  'DE ANTOFAGASTA':                    ['II'],
  'DE ATACAMA':                        ['III'],
  'DE COQUIMBO':                       ['IV'],
  'DE VALPARAISO':                     ['V'],
  'METROPOLITANA':                     ['RM'],
  'DEL LIBERTADOR B OHIGGINS':         ['VI'],
  'DEL MAULE':                         ['VII'],
  'DEL BIO-BIO':                       ['VIII', 'XVI'],
  'DE LA ARAUCANIA':                   ['IX'],
  'DE LOS LAGOS':                      ['X', 'XIV'],
  'DE AISEN':                          ['XI'],
  'DE MAGALLANES y ANTARTICA CHILENA': ['XII'],
}

const AREA_TYPE_LABELS: Record<string, string> = {
  parque_nacional: 'Parque Nacional', reserva_nacional: 'Reserva Nacional',
  monumento_natural: 'Monumento Natural', santuario_naturaleza: 'Santuario de la Naturaleza',
  area_marina: 'Área Marina Protegida', sitio_ramsar: 'Sitio Ramsar',
  Parques: 'Parque Nacional', Reservas: 'Reserva Nacional', Monumentos: 'Monumento Natural',
}

// ── Types ─────────────────────────────────────────────────────
type DrawerContent = { kind: 'species'; info: SpeciesClickInfo } | { kind: 'area'; info: AreaClickInfo } | null

interface SightingFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    id: string; speciesId: string; slug: string
    commonName: string; scientificName: string; uicnStatus: string | null
    photoUrl: string | null; observedAt: string | null; observerName: string | null
    regionCode: string | null
  }
}

interface SpeciesEntry {
  slug: string; commonName: string; scientificName: string
  uicnStatus: string | null; count: number
}

interface Props {
  sightings: SightingFeature[]
  speciesList: SpeciesEntry[]
  showProtectedAreas?: boolean
  selectedAreaSlugs?: string[]
}

// ── Component ─────────────────────────────────────────────────
export function MapLayout({ sightings, speciesList, showProtectedAreas = false, selectedAreaSlugs = [] }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL-based filters
  const [selectedTypes, setSelectedTypes] = useState<Set<SpeciesType>>(() => new Set(searchParams.getAll('type') as SpeciesType[]))
  const [selectedUicn, setSelectedUicn] = useState<Set<UICNStatus>>(() => new Set(searchParams.getAll('uicn') as UICNStatus[]))
  const [selectedEcos, setSelectedEcos] = useState<Set<string>>(() => new Set(searchParams.getAll('ecosystem')))
  const [endemic, setEndemic] = useState(searchParams.get('endemic') === 'true')
  const [showAreas, setShowAreas] = useState(searchParams.get('areas') === '1')
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(() => new Set(searchParams.getAll('area')))
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') ?? '')
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') ?? '')

  // Client-only state
  const [search, setSearch] = useState('')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // SNASPE filters
  const [snaspeTipo, setSnaspeTipo] = useState<string | null>(null)
  const [snaspeRegions, setSnaspeRegions] = useState<Set<string>>(new Set())

  // Right drawer
  const [drawer, setDrawer] = useState<DrawerContent>(null)

  // ── URL push ────────────────────────────────────────────────
  const pushFilters = useCallback((
    types: Set<SpeciesType>, uicn: Set<UICNStatus>, ecos: Set<string>,
    isEndemic: boolean, areas: boolean, areaSlugs: Set<string>, from = dateFrom, to = dateTo,
  ) => {
    const params = new URLSearchParams()
    types.forEach((t) => params.append('type', t))
    uicn.forEach((s) => params.append('uicn', s))
    ecos.forEach((e) => params.append('ecosystem', e))
    if (isEndemic) params.set('endemic', 'true')
    if (areas || areaSlugs.size > 0) params.set('areas', '1')
    areaSlugs.forEach((s) => params.append('area', s))
    if (from) params.set('dateFrom', from)
    if (to) params.set('dateTo', to)
    router.push(`/mapa?${params.toString()}`)
  }, [router, dateFrom, dateTo])

  // ── Filter toggles ───────────────────────────────────────────
  function toggleType(t: SpeciesType) {
    const next = new Set(selectedTypes); next.has(t) ? next.delete(t) : next.add(t)
    setSelectedTypes(next); pushFilters(next, selectedUicn, selectedEcos, endemic, showAreas, selectedAreas)
  }
  function toggleUicn(s: UICNStatus | null) {
    if (s === null) { setSelectedUicn(new Set()); pushFilters(selectedTypes, new Set(), selectedEcos, endemic, showAreas, selectedAreas); return }
    const next = new Set(selectedUicn); next.has(s) ? next.delete(s) : next.add(s)
    setSelectedUicn(next); pushFilters(selectedTypes, next, selectedEcos, endemic, showAreas, selectedAreas)
  }
  function toggleEco(e: string) {
    const next = new Set(selectedEcos); next.has(e) ? next.delete(e) : next.add(e)
    setSelectedEcos(next); pushFilters(selectedTypes, selectedUicn, next, endemic, showAreas, selectedAreas)
  }
  function toggleEndemic() {
    const next = !endemic; setEndemic(next)
    pushFilters(selectedTypes, selectedUicn, selectedEcos, next, showAreas, selectedAreas)
  }
  function toggleAreas() {
    const next = !showAreas; setShowAreas(next)
    const nextSlugs = next ? selectedAreas : new Set<string>()
    if (!next) setSelectedAreas(new Set())
    pushFilters(selectedTypes, selectedUicn, selectedEcos, endemic, next, nextSlugs)
  }
  function toggleArea(slug: string) {
    const next = new Set(selectedAreas); next.has(slug) ? next.delete(slug) : next.add(slug)
    setSelectedAreas(next); pushFilters(selectedTypes, selectedUicn, selectedEcos, endemic, true, next)
  }
  function applyDate(from: string, to: string) {
    pushFilters(selectedTypes, selectedUicn, selectedEcos, endemic, showAreas, selectedAreas, from, to)
  }
  function clearAll() {
    setSelectedTypes(new Set()); setSelectedUicn(new Set()); setSelectedEcos(new Set())
    setEndemic(false); setShowAreas(false); setSelectedAreas(new Set())
    setDateFrom(''); setDateTo(''); setSnaspeTipo(null); setSnaspeRegions(new Set())
    router.push('/mapa')
  }

  const hasFilters = selectedTypes.size > 0 || selectedUicn.size > 0 || selectedEcos.size > 0
    || endemic || showAreas || selectedAreas.size > 0 || !!dateFrom || !!dateTo
    || snaspeTipo !== null || snaspeRegions.size > 0

  // ── Filter sightings by selected regions ─────────────────────
  const filteredSightings = useMemo(() => {
    if (!snaspeRegions.size) return sightings
    const codes = new Set<string>()
    snaspeRegions.forEach((r) => { ;(SNASPE_TO_CODES[r] ?? []).forEach((c) => codes.add(c)) })
    return sightings.filter((s) => { const rc = s.properties.regionCode; return rc != null && codes.has(rc) })
  }, [sightings, snaspeRegions])

  // ── Recompute species list from filtered sightings ───────────
  const filteredSpeciesList = useMemo(() => {
    if (!snaspeRegions.size) return speciesList
    const map = new Map<string, SpeciesEntry>()
    filteredSightings.forEach((s) => {
      const { slug, commonName, scientificName, uicnStatus } = s.properties
      const ex = map.get(slug)
      if (ex) { ex.count++ } else { map.set(slug, { slug, commonName, scientificName, uicnStatus, count: 1 }) }
    })
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [snaspeRegions, filteredSightings, speciesList])

  // ── Text search ───────────────────────────────────────────────
  const displaySpecies = useMemo(() => {
    if (!search.trim()) return filteredSpeciesList
    const q = search.toLowerCase()
    return filteredSpeciesList.filter((s) => s.commonName.toLowerCase().includes(q) || s.scientificName.toLowerCase().includes(q))
  }, [filteredSpeciesList, search])

  // ── Click handlers ────────────────────────────────────────────
  function handleSpeciesClick(slug: string) {
    setSelectedSlug((prev) => (prev === slug ? null : slug))
    setIsDrawerOpen(false)
  }

  function handleSpeciesMapClick(info: SpeciesClickInfo) {
    setDrawer({ kind: 'species', info })
    setSelectedSlug(info.slug)
    setIsDrawerOpen(false)
  }

  function handleAreaMapClick(info: AreaClickInfo) {
    setDrawer({ kind: 'area', info })
    setIsDrawerOpen(false)
  }

  // ── Sidebar body (shared desktop + mobile) ────────────────────
  function SidebarBody() {
    return (
      <div className="flex-1 overflow-y-auto scroll-dark">

        {/* Estado de conservación */}
        <Section title="Estado de conservación">
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={selectedUicn.size === 0} onClick={() => toggleUicn(null)}>Todos</FilterChip>
            {UICN_STATUSES.map((s) => (
              <FilterChip key={s} active={selectedUicn.has(s)} onClick={() => toggleUicn(s)}>{s}</FilterChip>
            ))}
          </div>
        </Section>

        {/* Tipo de especie */}
        <Section title="Tipo de especie">
          <div className="flex flex-wrap gap-1.5">
            {SPECIES_TYPES.map((t) => (
              <FilterChip key={t} active={selectedTypes.has(t)} onClick={() => toggleType(t)}>
                {SPECIES_TYPE_LABELS[t]}
              </FilterChip>
            ))}
          </div>
        </Section>

        {/* Ecosistema */}
        <Section title="Ecosistema">
          <div className="flex flex-wrap gap-1.5">
            {ECOSYSTEMS.map(({ slug, label }) => (
              <FilterChip key={slug} active={selectedEcos.has(slug)} onClick={() => toggleEco(slug)}>{label}</FilterChip>
            ))}
          </div>
        </Section>

        {/* Tipo de área SNASPE */}
        <Section title="Tipo de área">
          <div className="flex flex-wrap gap-1.5">
            {SNASPE_TIPOS.map(({ value, label }) => (
              <FilterChip
                key={value ?? 'todos'}
                active={snaspeTipo === value}
                onClick={() => { if (value === null) setSnaspeTipo(null); else setSnaspeTipo(snaspeTipo === value ? null : value) }}
              >
                {label}
              </FilterChip>
            ))}
          </div>
        </Section>

        {/* Región */}
        <Section title="Región">
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scroll-dark">
            {REGION_LABELS.map(([key, label]) => (
              <FilterChip
                key={key}
                active={snaspeRegions.has(key)}
                onClick={() => {
                  const next = new Set(snaspeRegions)
                  next.has(key) ? next.delete(key) : next.add(key)
                  setSnaspeRegions(next)
                }}
              >
                {label}
              </FilterChip>
            ))}
          </div>
        </Section>

        {/* Atributos */}
        <Section title="Atributos">
          <div className="space-y-2">
            <DarkCheckbox checked={endemic} onChange={toggleEndemic} label="Endémica de Chile" />
            <DarkCheckbox checked={showAreas} onChange={toggleAreas} label="Áreas protegidas" />
            {showAreas && (
              <div className="ml-5 mt-1">
                <p className="text-[10px] text-zinc-500 mb-1">
                  {selectedAreas.size === 0 ? 'Mostrando todas — filtra por área:' : 'Áreas seleccionadas:'}
                </p>
                <AreaMultiSelect selected={selectedAreas} onChange={toggleArea} maxHeight="10rem" />
              </div>
            )}
          </div>
        </Section>

        {/* Período */}
        <Section title="Período de avistamiento">
          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-zinc-500 block mb-0.5">Desde</label>
              <input type="date" value={dateFrom} max={dateTo || undefined}
                onChange={(e) => { setDateFrom(e.target.value); applyDate(e.target.value, dateTo) }}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-200 focus:border-[#00E676] focus:outline-none transition-colors appearance-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-500 block mb-0.5">Hasta</label>
              <input type="date" value={dateTo} min={dateFrom || undefined}
                onChange={(e) => { setDateTo(e.target.value); applyDate(dateFrom, e.target.value) }}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-200 focus:border-[#00E676] focus:outline-none transition-colors appearance-none [color-scheme:dark]"
              />
            </div>
          </div>
        </Section>

        {hasFilters && (
          <div className="px-4 pb-3">
            <button onClick={clearAll} className="w-full text-xs text-zinc-500 hover:text-zinc-200 py-2 transition-colors border border-zinc-800 rounded-lg hover:border-zinc-700">
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="border-t border-zinc-800 mx-0" />

        {/* Species list */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            En el mapa
            <span className="ml-1.5 text-zinc-600 font-normal normal-case tracking-normal">
              ({displaySpecies.length} {displaySpecies.length === 1 ? 'especie' : 'especies'})
            </span>
          </p>
        </div>

        {displaySpecies.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-zinc-600">Sin resultados</p>
        ) : (
          <ul className="pb-4">
            {displaySpecies.map((sp) => {
              const hex = UICN_HEX[sp.uicnStatus ?? ''] ?? '#666'
              const isSelected = selectedSlug === sp.slug
              return (
                <li key={sp.slug} className="border-b border-zinc-900">
                  <button
                    onClick={() => handleSpeciesClick(sp.slug)}
                    className={cn(
                      'w-full text-left flex items-center gap-3 px-4 py-3 transition-colors',
                      isSelected ? 'bg-zinc-900 border-l-2 border-[#00E676]' : 'hover:bg-zinc-900/50'
                    )}
                  >
                    <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${hex}22`, color: hex }}>
                      {sp.uicnStatus ?? '—'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-grotesk font-medium truncate">{sp.commonName}</p>
                      <p className="text-xs text-zinc-500 font-serif italic truncate">{sp.scientificName}</p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-[#00E676] font-mono whitespace-nowrap">
                      {sp.count} avist.
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-3.5rem)]">

      {/* Map — always full area */}
      <div className="w-full h-full" data-cursor="dark">
        <RayenMap
          sightings={filteredSightings as any}
          showProtectedAreas={showProtectedAreas}
          selectedAreaSlugs={selectedAreaSlugs}
          selectedSlug={selectedSlug}
          snaspeTipo={snaspeTipo}
          snaspeRegions={snaspeRegions}
          snaspeEcos={selectedEcos}
          onSpeciesClick={handleSpeciesMapClick}
          onAreaClick={handleAreaMapClick}
        />

        {/* Desktop: floating open button */}
        <AnimatePresence>
          {!isSidebarOpen && (
            <motion.button
              key="open-btn"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarOpen(true)}
              className="hidden lg:flex absolute top-4 left-4 z-10 items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 hover:bg-zinc-800 transition-colors shadow-lg"
            >
              <GridBloomLogo size={20} />
              <span className="font-grotesk font-semibold text-white text-sm">Especies</span>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 right-4 z-10"><MapLegend /></div>

        {/* Mobile: open drawer */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="lg:hidden absolute bottom-6 left-4 z-10 flex items-center justify-center bg-[#00E676] text-black rounded-full p-3.5 shadow-lg"
        >
          <List className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="hidden lg:flex lg:flex-col absolute left-0 top-0 h-full w-80 bg-zinc-950 border-r border-zinc-800 z-20 shadow-2xl"
          >
            <div className="p-4 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <GridBloomLogo size={16} />
                    <span className="font-grotesk font-semibold text-white text-sm">Rayen</span>
                  </div>
                  <p className="text-zinc-400 text-[10px] uppercase tracking-widest mb-0.5">Avistamientos</p>
                  <p>
                    <span className="font-grotesk font-bold text-[#00E676] text-xl">{displaySpecies.length}</span>
                    <span className="text-zinc-500 text-xs ml-1.5">especies documentadas</span>
                  </p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-400 hover:text-white transition-colors p-1 -mr-1 flex-shrink-0 mt-0.5">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
                <input
                  type="text" placeholder="Buscar especie..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#00E676]/50 transition-colors"
                />
              </div>
            </div>
            <SidebarBody />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div key="drawer"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 rounded-t-2xl flex flex-col"
              style={{ height: '80vh' }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-800 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1"><GridBloomLogo size={14} /><span className="font-grotesk font-semibold text-white text-sm">Rayen</span></div>
                  <p className="text-zinc-500 text-xs">{displaySpecies.length} especies documentadas</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-zinc-400 hover:text-white transition-colors p-1"><X className="h-5 w-5" /></button>
              </div>
              <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
                  <input type="text" placeholder="Buscar especie..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#00E676]/50 transition-colors"
                  />
                </div>
              </div>
              <SidebarBody />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Right detail drawer */}
      <AnimatePresence>
        {drawer && (
          <RightDrawer key="right-drawer" content={drawer} onClose={() => setDrawer(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Right detail drawer ────────────────────────────────────────
function RightDrawer({ content, onClose }: { content: NonNullable<DrawerContent>; onClose: () => void }) {
  const shouldReduceMotion = useReducedMotion()
  const spring = shouldReduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 300, damping: 35 }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={spring}
      className="fixed right-0 z-40 bg-zinc-950 border-l border-zinc-800 flex flex-col w-full lg:w-[380px]"
      style={{ top: 56, height: 'calc(100vh - 56px)' }}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 bg-zinc-900 rounded-full p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <DrawerErrorBoundary>
        {content.kind === 'species'
          ? <SpeciesDrawerContent info={content.info} />
          : <AreaDrawerContent info={content.info} />
        }
      </DrawerErrorBoundary>
    </motion.div>
  )
}

// ── Safe string coercion (prevents React "object as child" crashes) ──────────
const safeString = (val: unknown): string => {
  if (typeof val === 'string') return val
  if (val === null || val === undefined) return ''
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

// ── Error boundary for drawer content ────────────────────────────────────────
class DrawerErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-zinc-500 text-sm">No se pudo cargar la ficha</p>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Species drawer content ────────────────────────────────────
function SpeciesDrawerContent({ info }: { info: SpeciesClickInfo }) {
  const [species, setSpecies] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true); setSpecies(null)
    fetch(`/api/species/${info.slug}`)
      .then(r => r.json())
      .then(({ data }) => setSpecies(data))
      .catch(() => setSpecies(null))
      .finally(() => setLoading(false))
  }, [info.slug])

  const photoUrl = species?.media?.find((m: any) => m.isPrimary || m.is_primary)?.url ?? info.photoUrl
  const uicnStatus = (species?.uicnStatus ?? species?.uicn_status ?? info.uicnStatus) as UICNStatus | null
  const uicnColor = uicnStatus ? (UICN_COLORS[uicnStatus] ?? '#666') : null
  const description = safeString(species?.description)
  const threatsLocal = safeString(species?.threatsLocal ?? species?.threats_local)
  const commonName = safeString(info.commonName)
  const scientificName = safeString(info.scientificName)
  const observerName = safeString(info.observerName)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto scroll-dark">
        {/* Hero */}
        <div className="relative">
          {photoUrl
            ? <img src={photoUrl} alt={commonName} referrerPolicy="no-referrer" className="w-full h-56 object-cover" />
            : <div className="w-full h-56 bg-zinc-900" />
          }
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 pointer-events-none" />
          {uicnStatus && uicnColor && (
            <span className="absolute top-4 left-4 text-xs font-semibold text-white px-3 py-1 rounded-full" style={{ backgroundColor: uicnColor }}>
              {UICN_LABELS[uicnStatus as keyof typeof UICN_LABELS] ?? uicnStatus}
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="font-grotesk font-bold text-white text-2xl leading-tight">{commonName}</h2>
            <p className="font-serif italic text-zinc-400 text-sm mt-0.5">{scientificName}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {description && (
            <p className="text-zinc-300 text-sm leading-relaxed">
              {description.slice(0, 200)}{description.length > 200 ? '…' : ''}
            </p>
          )}

          {threatsLocal && (
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Amenazas</p>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {threatsLocal.slice(0, 300)}{threatsLocal.length > 300 ? '…' : ''}
              </p>
            </div>
          )}

          {(info.observedAt || info.observerName) && (
            <div className="border-t border-zinc-800 pt-3 space-y-1">
              {info.observedAt && (
                <p className="text-zinc-500 text-xs">
                  {new Date(info.observedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              {observerName && <p className="text-zinc-500 text-xs">Observado por {observerName}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-zinc-800 p-4">
        <Link href={`/especies/${info.slug}`}
          className="flex items-center justify-center w-full bg-[#00E676] hover:bg-[#52F599] text-black font-grotesk font-semibold rounded-xl py-3 transition-colors text-sm"
        >
          Ver ficha completa →
        </Link>
      </div>
    </>
  )
}

// ── Area drawer content ───────────────────────────────────────
function AreaDrawerContent({ info }: { info: AreaClickInfo }) {
  const tipoLabel = info.tipo ? (AREA_TYPE_LABELS[info.tipo] ?? info.tipo) : 'Área Protegida'
  const displayName = info.nombre.replace(/\s*\[.*?\]\s*$/, '').trim()
  const regionDisplay = info.region
    ? info.region.charAt(0).toUpperCase() + info.region.slice(1).toLowerCase()
    : null
  const TipoIcon = info.tipo === 'Parques' || info.tipo === 'parque_nacional' ? TreePine
    : info.tipo === 'Reservas' || info.tipo === 'reserva_nacional' ? Shield
    : info.tipo === 'Monumentos' || info.tipo === 'monumento_natural' ? Star
    : TreePine

  return (
    <>
      <div className="flex-1 overflow-y-auto scroll-dark">
        {/* Hero — no photo */}
        <div className="h-48 bg-zinc-900 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
            <TipoIcon className="w-8 h-8" style={{ color: '#00E676' }} />
          </div>
          <div className="text-center px-4">
            <h2 className="font-grotesk font-bold text-white text-2xl leading-tight text-center">{displayName}</h2>
            <p className="text-[#00E676] text-sm mt-1">{tipoLabel}</p>
          </div>
        </div>

        {/* Data rows */}
        <div className="p-4 space-y-3">
          {info.superficie_ha != null && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <TipoIcon className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Superficie</p>
                <p className="text-zinc-200 text-sm font-medium">{Number(info.superficie_ha).toLocaleString('es-CL')} ha</p>
              </div>
            </div>
          )}
          {regionDisplay && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Región</p>
                <p className="text-zinc-200 text-sm font-medium">{regionDisplay}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-zinc-800 p-4">
        {info.slug ? (
          <Link href={`/areas-protegidas/${info.slug}`}
            className="flex items-center justify-center w-full bg-[#00E676] hover:bg-[#52F599] text-black font-grotesk font-semibold rounded-xl py-3 transition-colors text-sm"
          >
            Ver ficha completa →
          </Link>
        ) : (
          <p className="text-center text-zinc-500 text-sm py-2">Ficha próximamente</p>
        )}
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-t border-zinc-800/50">
      <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-2">{title}</h3>
      {children}
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs rounded-lg px-3 py-1.5 transition-all duration-150',
        active
          ? 'bg-[#00E676] text-black font-medium'
          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
      )}
    >
      {children}
    </button>
  )
}

function DarkCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
      <input type="checkbox" checked={checked} onChange={onChange}
        className="h-3.5 w-3.5 rounded border-zinc-600 accent-[#00E676] focus:ring-[#00E676]"
      />
      {label}
    </label>
  )
}

function GridBloomLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="2.5" fill="#00E676" />
      <circle cx="16" cy="7"  r="3.5" fill="#00E676" />
      <circle cx="23.8" cy="11.5" r="3.5" fill="#00E676" />
      <circle cx="23.8" cy="20.5" r="3.5" fill="#00E676" />
      <circle cx="16" cy="25" r="3.5" fill="#00E676" />
      <circle cx="8.2" cy="20.5" r="3.5" fill="#00E676" />
      <circle cx="8.2" cy="11.5" r="3.5" fill="#00E676" />
    </svg>
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
