'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { ProtectedAreaBasic } from '@/lib/db'
import { cn } from '@/lib/utils'

// ── Macrozonas ───────────────────────────────────────────────

const MACROZONES: { value: string; label: string; keywords: string[] }[] = [
  {
    value: 'Norte Grande',
    label: 'Norte Grande',
    keywords: ['Arica', 'Tarapacá', 'Antofagasta'],
  },
  {
    value: 'Norte Chico',
    label: 'Norte Chico',
    keywords: ['Atacama', 'Coquimbo'],
  },
  {
    value: 'Zona Central',
    label: 'Zona Central',
    keywords: ['Valparaíso', 'Metropolitana', "O'Higgins", 'Higgins', 'Maule'],
  },
  {
    value: 'Zona Sur',
    label: 'Zona Sur',
    keywords: ['Ñuble', 'Biobío', 'Bío', 'Araucanía', 'Los Ríos', 'Los Lagos'],
  },
  {
    value: 'Zona Austral',
    label: 'Zona Austral',
    keywords: ['Aysén', 'Magallanes'],
  },
]

function getMacrozone(regionName: string | null): string | null {
  if (!regionName) return null
  for (const zone of MACROZONES) {
    if (zone.keywords.some((k) => regionName.toLowerCase().includes(k.toLowerCase()))) {
      return zone.value
    }
  }
  return null
}

// ── Tipos ────────────────────────────────────────────────────

const TIPO_OPTIONS = [
  { value: 'parque_nacional',      label: 'Parque Nacional' },
  { value: 'reserva_nacional',     label: 'Reserva Nacional' },
  { value: 'monumento_natural',    label: 'Monumento Natural' },
  { value: 'santuario_naturaleza', label: 'Santuario de la Naturaleza' },
]

const VALID_TIPOS = new Set(TIPO_OPTIONS.map((o) => o.value))
const VALID_ZONAS = new Set(MACROZONES.map((z) => z.value))

const TIPO_LABELS: Record<string, string> = {
  parque_nacional:      'Parque Nacional',
  reserva_nacional:     'Reserva Nacional',
  monumento_natural:    'Monumento Natural',
  santuario_naturaleza: 'Santuario de la Naturaleza',
  area_marina:          'Área Marina Protegida',
  sitio_ramsar:         'Sitio Ramsar',
  otro:                 'Otra',
}

const TIPO_COLORS: Record<string, string> = {
  parque_nacional:      'bg-stone-100 text-stone-700',
  reserva_nacional:     'bg-stone-100 text-stone-700',
  monumento_natural:    'bg-amber-100 text-amber-800',
  santuario_naturaleza: 'bg-sky-100 text-sky-800',
  area_marina:          'bg-blue-100 text-blue-800',
  sitio_ramsar:         'bg-cyan-100 text-cyan-800',
  otro:                 'bg-stone-100 text-stone-600',
}

// ── Helpers ──────────────────────────────────────────────────

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

function Chip({
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
      type="button"
      onClick={onClick}
      className={cn(
        'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-[#00E676] text-black'
          : 'bg-zinc-800 text-white hover:bg-zinc-700'
      )}
    >
      {children}
    </button>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide flex-shrink-0 w-14 pt-1">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────

interface Props {
  areas: ProtectedAreaBasic[]
}

export function AreasFilterGrid({ areas }: Props) {
  const searchParams = useSearchParams()

  const [tipos, setTipos] = useState<string[]>(() => {
    const val = searchParams.get('tipo')
    if (!val) return []
    return val.split(',').filter((v) => VALID_TIPOS.has(v))
  })

  const [zonas, setZonas] = useState<string[]>(() => {
    const val = searchParams.get('zona')
    if (!val) return []
    return val.split(',').filter((v) => VALID_ZONAS.has(v))
  })

  const [query, setQuery] = useState<string>(() => {
    return searchParams.get('q') ?? ''
  })

  // Sync filter state → URL without triggering a server re-render
  useEffect(() => {
    const params = new URLSearchParams()
    if (tipos.length > 0) params.set('tipo', tipos.join(','))
    if (zonas.length > 0) params.set('zona', zonas.join(','))
    if (query.trim()) params.set('q', query.trim())

    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `/areas-protegidas?${qs}` : '/areas-protegidas')
  }, [tipos, zonas, query])

  const hasFilters = tipos.length > 0 || zonas.length > 0 || query.trim() !== ''

  function clearFilters() {
    setTipos([])
    setZonas([])
    setQuery('')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return areas.filter((a) => {
      if (tipos.length > 0 && !tipos.includes(a.type)) return false
      if (zonas.length > 0) {
        const zone = getMacrozone(a.regionName)
        if (!zone || !zonas.includes(zone)) return false
      }
      if (q && !a.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [areas, tipos, zonas, query])

  return (
    <div>
      {/* Barra de filtros */}
      <div className="rounded-2xl bg-zinc-900 px-5 py-4 mb-6 space-y-3">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre del área..."
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00E676]/60 focus:border-[#00E676]/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Tipo — multi-select */}
        <FilterRow label="Tipo">
          <Chip active={tipos.length === 0} onClick={() => setTipos([])}>
            Todos
          </Chip>
          {TIPO_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={tipos.includes(opt.value)}
              onClick={() => setTipos((prev) => toggle(prev, opt.value))}
            >
              {opt.label}
            </Chip>
          ))}
        </FilterRow>

        {/* Zona — multi-select */}
        <FilterRow label="Zona">
          <Chip active={zonas.length === 0} onClick={() => setZonas([])}>
            Todos
          </Chip>
          {MACROZONES.map((z) => (
            <Chip
              key={z.value}
              active={zonas.includes(z.value)}
              onClick={() => setZonas((prev) => toggle(prev, z.value))}
            >
              {z.label}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {/* Conteo + limpiar */}
      <div className="flex items-center justify-between mb-5 min-h-[24px]">
        {hasFilters ? (
          <p className="text-sm text-stone-500">
            <span className="font-semibold text-stone-800">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'área encontrada' : 'áreas encontradas'}
          </p>
        ) : (
          <p className="text-sm text-stone-500">
            {areas.length} {areas.length === 1 ? 'área registrada' : 'áreas registradas'}
          </p>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">Sin resultados</p>
          <p className="text-sm mt-1">Prueba con otros filtros o limpia la búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((area) => (
            <Link
              key={area.slug}
              href={`/areas-protegidas/${area.slug}`}
              className="group rounded-2xl border border-stone-200 bg-white overflow-hidden hover:shadow-md hover:border-neon-400/40 transition-all"
            >
              <div className="h-40 relative overflow-hidden flex items-end p-3">
                {area.photoUrl ? (
                  <Image
                    src={area.photoUrl}
                    alt={area.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={75}
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-carbon-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span
                  className={`relative z-10 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${
                    TIPO_COLORS[area.type] ?? 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {TIPO_LABELS[area.type] ?? area.type}
                </span>
              </div>

              <div className="p-4">
                <h2 className="font-semibold text-stone-900 group-hover:text-neon-600 transition-colors leading-tight">
                  {area.name}
                </h2>
                {area.regionName && (
                  <p className="text-xs text-stone-500 mt-1">{area.regionName}</p>
                )}
                {area.areaHa && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    {Number(area.areaHa).toLocaleString('es-CL')} ha
                  </p>
                )}
                {area.description && (
                  <p className="text-xs text-stone-500 mt-2 line-clamp-2">
                    {area.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
