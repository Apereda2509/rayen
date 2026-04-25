'use client'

import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, List, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import { MapLegend } from '@/components/map/MapLegend'
import { AreaMultiSelect } from '@/components/ui/AreaMultiSelect'
import { SPECIES_TYPE_LABELS, type SpeciesType, type UICNStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────

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

// ── Constants ────────────────────────────────────────────────

const RayenMap = nextDynamic(
  () => import('@/components/map/RayenMap').then((m) => m.RayenMap),
  { ssr: false, loading: () => <MapSkeleton /> }
)

const UICN_STATUSES: UICNStatus[] = ['CR', 'EN', 'VU', 'NT', 'LC']

const UICN_HEX: Record<string, string> = {
  CR: '#D85A30', EN: '#D85A30', VU: '#F59E0B', NT: '#78716C', LC: '#00E676',
}

const SPECIES_TYPES: SpeciesType[] = [
  'mamifero', 'ave', 'planta', 'anfibio', 'reptil', 'pez', 'insecto', 'hongo',
]

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
  { value: null,            label: 'Todos' },
  { value: 'Parques',       label: 'Parques' },
  { value: 'Reservas',      label: 'Reservas' },
  { value: 'Monumentos',    label: 'Monumentos' },
  { value: '__sin_tipo__',  label: 'Sin clasificar' },
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

// ── Component ────────────────────────────────────────────────

export function MapLayout({
  sightings,
  speciesList,
  showProtectedAreas = false,
  selectedAreaSlugs = [],
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── URL-based filter state (synced with server re-fetch) ──
  const [selectedTypes, setSelectedTypes] = useState<Set<SpeciesType>>(
    () => new Set(searchParams.getAll('type') as SpeciesType[])
  )
  const [selectedUicn, setSelectedUicn] = useState<Set<UICNStatus>>(
    () => new Set(searchParams.getAll('uicn') as UICNStatus[])
  )
  const [selectedEcos, setSelectedEcos] = useState<Set<string>>(
    () => new Set(searchParams.getAll('ecosystem'))
  )
  const [endemic, setEndemic] = useState(searchParams.get('endemic') === 'true')
  const [showAreas, setShowAreas] = useState(searchParams.get('areas') === '1')
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(
    () => new Set(searchParams.getAll('area'))
  )
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') ?? '')
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') ?? '')

  // ── Client-only state ────────────────────────────────────
  const [search, setSearch] = useState('')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [snaspeTipo, setSnaspeTipo] = useState<string | null>(null)
  const [snaspeRegion, setSnaspeRegion] = useState<string | null>(null)

  // ── URL push ─────────────────────────────────────────────
  const pushFilters = useCallback((
    types: Set<SpeciesType>,
    uicn: Set<UICNStatus>,
    ecos: Set<string>,
    isEndemic: boolean,
    areas: boolean,
    areaSlugs: Set<string>,
    from = dateFrom,
    to = dateTo,
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

  // ── Filter toggles ───────────────────────────────────────
  function toggleType(t: SpeciesType) {
    const next = new Set(selectedTypes)
    next.has(t) ? next.delete(t) : next.add(t)
    setSelectedTypes(next)
    pushFilters(next, selectedUicn, selectedEcos, endemic, showAreas, selectedAreas)
  }

  function toggleUicn(s: UICNStatus | null) {
    if (s === null) {
      setSelectedUicn(new Set())
      pushFilters(selectedTypes, new Set(), selectedEcos, endemic, showAreas, selectedAreas)
      return
    }
    const next = new Set(selectedUicn)
    next.has(s) ? next.delete(s) : next.add(s)
    setSelectedUicn(next)
    pushFilters(selectedTypes, next, selectedEcos, endemic, showAreas, selectedAreas)
  }

  function toggleEco(e: string) {
    const next = new Set(selectedEcos)
    next.has(e) ? next.delete(e) : next.add(e)
    setSelectedEcos(next)
    pushFilters(selectedTypes, selectedUicn, next, endemic, showAreas, selectedAreas)
  }

  function toggleEndemic() {
    const next = !endemic
    setEndemic(next)
    pushFilters(selectedTypes, selectedUicn, selectedEcos, next, showAreas, selectedAreas)
  }

  function toggleAreas() {
    const next = !showAreas
    setShowAreas(next)
    const nextSlugs = next ? selectedAreas : new Set<string>()
    if (!next) setSelectedAreas(new Set())
    pushFilters(selectedTypes, selectedUicn, selectedEcos, endemic, next, nextSlugs)
  }

  function toggleArea(slug: string) {
    const next = new Set(selectedAreas)
    next.has(slug) ? next.delete(slug) : next.add(slug)
    setSelectedAreas(next)
    pushFilters(selectedTypes, selectedUicn, selectedEcos, endemic, true, next)
  }

  function applyDate(from: string, to: string) {
    pushFilters(selectedTypes, selectedUicn, selectedEcos, endemic, showAreas, selectedAreas, from, to)
  }

  function clearAll() {
    setSelectedTypes(new Set())
    setSelectedUicn(new Set())
    setSelectedEcos(new Set())
    setEndemic(false)
    setShowAreas(false)
    setSelectedAreas(new Set())
    setDateFrom('')
    setDateTo('')
    router.push('/mapa')
  }

  const hasFilters = selectedTypes.size > 0 || selectedUicn.size > 0 || selectedEcos.size > 0
    || endemic || showAreas || selectedAreas.size > 0 || dateFrom || dateTo

  // ── Client-side text search on species list ──────────────
  const filteredSpecies = useMemo(() => {
    if (!search.trim()) return speciesList
    const q = search.toLowerCase()
    return speciesList.filter(
      (s) =>
        s.commonName.toLowerCase().includes(q) ||
        s.scientificName.toLowerCase().includes(q)
    )
  }, [speciesList, search])

  function handleSpeciesClick(slug: string) {
    setSelectedSlug((prev) => (prev === slug ? null : slug))
    setIsDrawerOpen(false)
  }

  // ── Shared sidebar inner content (filters + list) ────────
  function SidebarBody({ compact = false }: { compact?: boolean }) {
    return (
      <div className={cn('flex-1 overflow-y-auto scroll-dark', compact ? '' : '')}>

        {/* Estado de conservación */}
        <Section title="Estado de conservación">
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={selectedUicn.size === 0}
              onClick={() => toggleUicn(null)}
            >
              Todos
            </FilterChip>
            {UICN_STATUSES.map((s) => (
              <FilterChip
                key={s}
                active={selectedUicn.has(s)}
                onClick={() => toggleUicn(s)}
              >
                {s}
              </FilterChip>
            ))}
          </div>
        </Section>

        {/* Tipo de especie */}
        <Section title="Tipo de especie">
          <div className="flex flex-wrap gap-1.5">
            {SPECIES_TYPES.map((t) => (
              <FilterChip
                key={t}
                active={selectedTypes.has(t)}
                onClick={() => toggleType(t)}
              >
                {SPECIES_TYPE_LABELS[t]}
              </FilterChip>
            ))}
          </div>
        </Section>

        {/* Ecosistema */}
        <Section title="Ecosistema">
          <div className="flex flex-wrap gap-1.5">
            {ECOSYSTEMS.map(({ slug, label }) => (
              <FilterChip
                key={slug}
                active={selectedEcos.has(slug)}
                onClick={() => toggleEco(slug)}
              >
                {label}
              </FilterChip>
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
                onClick={() => {
                  if (value === null) setSnaspeTipo(null)
                  else setSnaspeTipo(snaspeTipo === value ? null : value)
                }}
              >
                {label}
              </FilterChip>
            ))}
          </div>
        </Section>

        {/* Región SNASPE */}
        <Section title="Región">
          <select
            value={snaspeRegion ?? ''}
            onChange={(e) => setSnaspeRegion(e.target.value || null)}
            className="w-full text-xs rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-[#00E676] focus:outline-none transition-colors [color-scheme:dark]"
          >
            <option value="">Todas las regiones</option>
            {REGION_LABELS.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </Section>

        {/* Atributos */}
        <Section title="Atributos">
          <div className="space-y-2">
            <DarkCheckbox
              checked={endemic}
              onChange={toggleEndemic}
              label="Endémica de Chile"
            />
            <DarkCheckbox
              checked={showAreas}
              onChange={toggleAreas}
              label="Áreas protegidas"
            />
            {showAreas && (
              <div className="ml-5 mt-1">
                <p className="text-[10px] text-zinc-500 mb-1">
                  {selectedAreas.size === 0
                    ? 'Mostrando todas — filtra por área:'
                    : 'Áreas seleccionadas:'}
                </p>
                <AreaMultiSelect
                  selected={selectedAreas}
                  onChange={toggleArea}
                  maxHeight="10rem"
                />
              </div>
            )}
          </div>
        </Section>

        {/* Período */}
        <Section title="Período de avistamiento">
          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-zinc-500 block mb-0.5">Desde</label>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  applyDate(e.target.value, dateTo)
                }}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-200 focus:border-[#00E676] focus:outline-none transition-colors appearance-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-500 block mb-0.5">Hasta</label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  applyDate(dateFrom, e.target.value)
                }}
                className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-200 focus:border-[#00E676] focus:outline-none transition-colors appearance-none [color-scheme:dark]"
              />
            </div>
          </div>
        </Section>

        {/* Clear filters */}
        {hasFilters && (
          <div className="px-4 pb-3">
            <button
              onClick={clearAll}
              className="w-full text-xs text-zinc-500 hover:text-zinc-200 py-2 transition-colors border border-zinc-800 rounded-lg hover:border-zinc-700"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Species list separator */}
        <div className="border-t border-zinc-800 mx-0" />

        {/* Species list */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Avistamientos en mapa
            <span className="ml-1.5 text-zinc-600 font-normal normal-case tracking-normal">
              ({filteredSpecies.length} {filteredSpecies.length === 1 ? 'especie' : 'especies'})
            </span>
          </p>
        </div>

        {filteredSpecies.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-zinc-600">Sin resultados</p>
        ) : (
          <ul className="pb-4">
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
                      {sp.count} {sp.count === 1 ? 'avist.' : 'avist.'}
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

      {/* ── Map — always full area ────────────────────────────── */}
      <div className="w-full h-full" data-cursor="dark">
        <RayenMap
          sightings={sightings as any}
          showProtectedAreas={showProtectedAreas}
          selectedAreaSlugs={selectedAreaSlugs}
          selectedSlug={selectedSlug}
          snaspeTipo={snaspeTipo}
          snaspeRegion={snaspeRegion}
          snaspeEcos={selectedEcos}
        />

        {/* Desktop: floating open button (hidden when sidebar is open) */}
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
              aria-label="Abrir panel de especies"
            >
              <GridBloomLogo size={20} />
              <span className="font-grotesk font-semibold text-white text-sm">Especies</span>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 right-4 z-10">
          <MapLegend />
        </div>

        {/* Mobile: open drawer */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="lg:hidden absolute bottom-6 left-4 z-10 flex items-center justify-center bg-[#00E676] text-black rounded-full p-3.5 shadow-lg"
          aria-label="Ver lista de especies"
        >
          <List className="h-5 w-5" />
        </button>
      </div>

      {/* ── Desktop sidebar — slides over the map ────────────── */}
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
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-grotesk font-semibold text-white text-lg leading-tight">
                    Avistamientos
                  </h2>
                  <p className="text-zinc-500 text-sm mt-0.5">
                    {speciesList.length} especies documentadas
                  </p>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors p-1 -mr-1 flex-shrink-0 mt-0.5"
                  aria-label="Cerrar panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
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

            {/* Scrollable filters + species list */}
            <SidebarBody />
          </motion.aside>
        )}
      </AnimatePresence>

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
              {/* Drawer header */}
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
              {/* Search */}
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
              {/* Filters + list */}
              <SidebarBody />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-zinc-900">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs px-2.5 py-1 rounded-full transition-colors',
        active
          ? 'bg-[#00E676] text-black font-medium'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
      )}
    >
      {children}
    </button>
  )
}

function DarkCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: React.ReactNode
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 rounded border-zinc-600 accent-[#00E676] focus:ring-[#00E676]"
      />
      {label}
    </label>
  )
}

function GridBloomLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
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
