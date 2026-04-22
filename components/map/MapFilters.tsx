'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AreaMultiSelect } from '@/components/ui/AreaMultiSelect'
import {
  SPECIES_TYPE_LABELS,
  type SpeciesType, type UICNStatus,
} from '@/lib/types'

const TYPES: SpeciesType[] = [
  'mamifero', 'ave', 'planta', 'anfibio',
  'reptil', 'pez', 'insecto', 'hongo',
]

const STATUS: { value: UICNStatus; label: string; hex: string }[] = [
  { value: 'CR', label: 'Peligro crítico',    hex: '#D85A30' },
  { value: 'EN', label: 'En peligro',         hex: '#BA7517' },
  { value: 'VU', label: 'Vulnerable',         hex: '#EF9F27' },
  { value: 'NT', label: 'Casi amenazada',     hex: '#639922' },
  { value: 'LC', label: 'Preocupación menor', hex: '#1D9E75' },
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

export function MapFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedTypes, setSelectedTypes] = useState<Set<SpeciesType>>(
    new Set(searchParams.getAll('type') as SpeciesType[])
  )
  const [selectedStatus, setSelectedStatus] = useState<Set<UICNStatus>>(
    new Set(searchParams.getAll('uicn') as UICNStatus[])
  )
  const [selectedEcos, setSelectedEcos] = useState<Set<string>>(
    new Set(searchParams.getAll('ecosystem'))
  )
  const [endemic, setEndemic] = useState(searchParams.get('endemic') === 'true')
  const [showAreas, setShowAreas] = useState(searchParams.get('areas') === '1')
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(
    new Set(searchParams.getAll('area'))
  )
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') ?? '')
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') ?? '')

  const pushFilters = useCallback((
    types: Set<SpeciesType>,
    status: Set<UICNStatus>,
    ecos: Set<string>,
    isEndemic: boolean,
    areas: boolean,
    areaSlugs: Set<string>,
    from = dateFrom,
    to = dateTo,
  ) => {
    const params = new URLSearchParams()
    types.forEach((t) => params.append('type', t))
    status.forEach((s) => params.append('uicn', s))
    ecos.forEach((e) => params.append('ecosystem', e))
    if (isEndemic) params.set('endemic', 'true')
    if (areas || areaSlugs.size > 0) params.set('areas', '1')
    areaSlugs.forEach((s) => params.append('area', s))
    if (from) params.set('dateFrom', from)
    if (to) params.set('dateTo', to)
    router.push(`/mapa?${params.toString()}`)
  }, [router, dateFrom, dateTo])

  const toggleType = (t: SpeciesType) => {
    const next = new Set(selectedTypes)
    next.has(t) ? next.delete(t) : next.add(t)
    setSelectedTypes(next)
    pushFilters(next, selectedStatus, selectedEcos, endemic, showAreas, selectedAreas)
  }

  const toggleStatus = (s: UICNStatus) => {
    const next = new Set(selectedStatus)
    next.has(s) ? next.delete(s) : next.add(s)
    setSelectedStatus(next)
    pushFilters(selectedTypes, next, selectedEcos, endemic, showAreas, selectedAreas)
  }

  const toggleEco = (e: string) => {
    const next = new Set(selectedEcos)
    next.has(e) ? next.delete(e) : next.add(e)
    setSelectedEcos(next)
    pushFilters(selectedTypes, selectedStatus, next, endemic, showAreas, selectedAreas)
  }

  const toggleEndemic = () => {
    const next = !endemic
    setEndemic(next)
    pushFilters(selectedTypes, selectedStatus, selectedEcos, next, showAreas, selectedAreas)
  }

  const toggleAreas = () => {
    const next = !showAreas
    setShowAreas(next)
    // Al desactivar, limpiar también las áreas seleccionadas
    const nextAreas = next ? selectedAreas : new Set<string>()
    if (!next) setSelectedAreas(new Set())
    pushFilters(selectedTypes, selectedStatus, selectedEcos, endemic, next, nextAreas)
  }

  const toggleArea = (slug: string) => {
    const next = new Set(selectedAreas)
    next.has(slug) ? next.delete(slug) : next.add(slug)
    setSelectedAreas(next)
    pushFilters(selectedTypes, selectedStatus, selectedEcos, endemic, true, next)
  }

  const applyDate = (from: string, to: string) => {
    pushFilters(selectedTypes, selectedStatus, selectedEcos, endemic, showAreas, selectedAreas, from, to)
  }

  const clearAll = () => {
    setSelectedTypes(new Set())
    setSelectedStatus(new Set())
    setSelectedEcos(new Set())
    setEndemic(false)
    setShowAreas(false)
    setSelectedAreas(new Set())
    setDateFrom('')
    setDateTo('')
    router.push('/mapa')
  }

  const hasFilters = selectedTypes.size > 0 || selectedStatus.size > 0 || selectedEcos.size > 0
    || endemic || showAreas || selectedAreas.size > 0 || dateFrom || dateTo

  return (
    <div className="p-4 space-y-6">

      <Section title="Tipo de especie">
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <Pill key={t} active={selectedTypes.has(t)} onClick={() => toggleType(t)}>
              {SPECIES_TYPE_LABELS[t]}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Estado de conservación">
        <div className="space-y-1.5">
          {STATUS.map(({ value, label, hex }) => (
            <Checkbox
              key={value}
              checked={selectedStatus.has(value)}
              onChange={() => toggleStatus(value)}
              label={
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                  <span><span className="font-medium">{value}</span> · {label}</span>
                </div>
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Atributos">
        <div className="space-y-1.5">
          <Checkbox
            checked={endemic}
            onChange={toggleEndemic}
            label="Endémica de Chile"
          />
          <Checkbox
            checked={showAreas}
            onChange={toggleAreas}
            label={
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0 bg-emerald-500 opacity-70" />
                <span>Áreas protegidas</span>
              </div>
            }
          />
          {showAreas && (
            <div className="ml-5 mt-1">
              <p className="text-[10px] text-stone-400 mb-0.5">
                {selectedAreas.size === 0 ? 'Mostrando todas — filtra por área:' : 'Áreas seleccionadas:'}
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

      <Section title="Ecosistema">
        <div className="flex flex-wrap gap-1.5">
          {ECOSYSTEMS.map(({ slug, label }) => (
            <Pill key={slug} active={selectedEcos.has(slug)} onClick={() => toggleEco(slug)}>
              {label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Período de avistamiento">
        <div className="space-y-2">
          <div>
            <label className="text-[11px] text-stone-400 block mb-0.5">Desde</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => {
                setDateFrom(e.target.value)
                applyDate(e.target.value, dateTo)
              }}
              className="w-full text-xs rounded-md border border-stone-200 px-2 py-1.5 text-stone-700 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-stone-400 block mb-0.5">Hasta</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => {
                setDateTo(e.target.value)
                applyDate(dateFrom, e.target.value)
              }}
              className="w-full text-xs rounded-md border border-stone-200 px-2 py-1.5 text-stone-700 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>
        </div>
      </Section>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="w-full text-xs text-stone-500 hover:text-stone-900 py-2 transition-colors border-t border-stone-100 pt-3"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

// ── Subcomponentes ──────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Pill({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs px-3 py-1 rounded-full transition-colors',
        active ? 'bg-teal-600 text-white font-medium' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
      )}
    >
      {children}
    </button>
  )
}

function Checkbox({ checked, onChange, label }: {
  checked: boolean; onChange: () => void; label: React.ReactNode
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 hover:text-stone-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 rounded border-stone-300 text-teal-600 focus:ring-teal-600"
      />
      {label}
    </label>
  )
}
