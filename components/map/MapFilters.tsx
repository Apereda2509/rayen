'use client'

import { useState, useCallback } from 'react'
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

const STATUS: { value: UICNStatus; label: string; color: string }[] = [
  { value: 'CR', label: 'Peligro crítico',      color: 'bg-coral-400' },
  { value: 'EN', label: 'En peligro',           color: 'bg-amber-600' },
  { value: 'VU', label: 'Vulnerable',           color: 'bg-amber-400' },
  { value: 'NT', label: 'Casi amenazada',       color: 'bg-forest-400' },
  { value: 'LC', label: 'Preocupación menor',   color: 'bg-teal-400' },
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

  const update = useCallback(() => {
    const params = new URLSearchParams()
    selectedTypes.forEach((t) => params.append('type', t))
    selectedStatus.forEach((s) => params.append('uicn', s))
    selectedEcos.forEach((e) => params.append('ecosystem', e))
    if (endemic) params.set('endemic', 'true')
    router.push(`/mapa?${params.toString()}`)
  }, [selectedTypes, selectedStatus, selectedEcos, endemic, router])

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set)
    next.has(value) ? next.delete(value) : next.add(value)
    return next
  }

  return (
    <div className="p-4 space-y-6">

      <Section title="Tipo de especie">
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <Pill
              key={t}
              active={selectedTypes.has(t)}
              onClick={() => {
                setSelectedTypes((prev) => toggle(prev, t))
                setTimeout(update, 0)
              }}
            >
              {SPECIES_TYPE_LABELS[t]}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Estado de conservación">
        <div className="space-y-1.5">
          {STATUS.map(({ value, label, color }) => (
            <Checkbox
              key={value}
              checked={selectedStatus.has(value)}
              onChange={() => {
                setSelectedStatus((prev) => toggle(prev, value))
                setTimeout(update, 0)
              }}
              label={
                <div className="flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
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
          onChange={() => { setEndemic(!endemic); setTimeout(update, 0) }}
          label="Endémica de Chile"
        />
      </Section>

      <Section title="Ecosistema">
        <div className="flex flex-wrap gap-1.5">
          {ECOSYSTEMS.map(({ slug, label }) => (
            <Pill
              key={slug}
              active={selectedEcos.has(slug)}
              onClick={() => {
                setSelectedEcos((prev) => toggle(prev, slug))
                setTimeout(update, 0)
              }}
            >
              {label}
            </Pill>
          ))}
        </div>
      </Section>

      <button
        onClick={() => router.push('/mapa')}
        className="w-full text-xs text-stone-500 hover:text-stone-900 py-2 transition-colors"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

// ── Subcomponentes ─────────────────────────────────────────

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
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs px-3 py-1 rounded-full transition-colors',
        active
          ? 'bg-teal-400 text-white font-medium'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
      )}
    >
      {children}
    </button>
  )
}

function Checkbox({ checked, onChange, label }: {
  checked: boolean
  onChange: () => void
  label: React.ReactNode
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 hover:text-stone-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 rounded border-stone-300 text-teal-400 focus:ring-teal-400"
      />
      {label}
    </label>
  )
}
