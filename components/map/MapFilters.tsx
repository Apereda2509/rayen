'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
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

  // Navegar cuando cambia cualquier filtro — sin closure stale
  const pushFilters = useCallback((
    types: Set<SpeciesType>,
    status: Set<UICNStatus>,
    ecos: Set<string>,
    isEndemic: boolean,
  ) => {
    const params = new URLSearchParams()
    types.forEach((t) => params.append('type', t))
    status.forEach((s) => params.append('uicn', s))
    ecos.forEach((e) => params.append('ecosystem', e))
    if (isEndemic) params.set('endemic', 'true')
    router.push(`/mapa?${params.toString()}`)
  }, [router])

  const toggleType = (t: SpeciesType) => {
    const next = new Set(selectedTypes)
    next.has(t) ? next.delete(t) : next.add(t)
    setSelectedTypes(next)
    pushFilters(next, selectedStatus, selectedEcos, endemic)
  }

  const toggleStatus = (s: UICNStatus) => {
    const next = new Set(selectedStatus)
    next.has(s) ? next.delete(s) : next.add(s)
    setSelectedStatus(next)
    pushFilters(selectedTypes, next, selectedEcos, endemic)
  }

  const toggleEco = (e: string) => {
    const next = new Set(selectedEcos)
    next.has(e) ? next.delete(e) : next.add(e)
    setSelectedEcos(next)
    pushFilters(selectedTypes, selectedStatus, next, endemic)
  }

  const toggleEndemic = () => {
    const next = !endemic
    setEndemic(next)
    pushFilters(selectedTypes, selectedStatus, selectedEcos, next)
  }

  const clearAll = () => {
    setSelectedTypes(new Set())
    setSelectedStatus(new Set())
    setSelectedEcos(new Set())
    setEndemic(false)
    router.push('/mapa')
  }

  const hasFilters = selectedTypes.size > 0 || selectedStatus.size > 0 || selectedEcos.size > 0 || endemic

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
        <Checkbox
          checked={endemic}
          onChange={toggleEndemic}
          label="Endémica de Chile"
        />
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
