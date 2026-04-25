'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { ProtectedAreaBasic } from '@/lib/db'
import { cn } from '@/lib/utils'

// ── Macrozonas ────────────────────────────────────────────────

const MACROZONES: { value: string; label: string; keywords: string[] }[] = [
  { value: 'Norte Grande', label: 'Norte Grande', keywords: ['Arica', 'Tarapacá', 'Antofagasta'] },
  { value: 'Norte Chico',  label: 'Norte Chico',  keywords: ['Atacama', 'Coquimbo'] },
  { value: 'Zona Central', label: 'Zona Central', keywords: ['Valparaíso', 'Metropolitana', "O'Higgins", 'Higgins', 'Maule'] },
  { value: 'Zona Sur',     label: 'Zona Sur',     keywords: ['Ñuble', 'Biobío', 'Bío', 'Araucanía', 'Los Ríos', 'Los Lagos'] },
  { value: 'Zona Austral', label: 'Zona Austral', keywords: ['Aysén', 'Magallanes'] },
]

function getMacrozone(regionName: string | null): string | null {
  if (!regionName) return null
  for (const zone of MACROZONES) {
    if (zone.keywords.some((k) => regionName.toLowerCase().includes(k.toLowerCase()))) return zone.value
  }
  return null
}

// ── Tipos ─────────────────────────────────────────────────────

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

const TIPO_BADGE_COLORS: Record<string, string> = {
  parque_nacional:      'bg-emerald-900/80 text-emerald-300',
  reserva_nacional:     'bg-blue-900/80 text-blue-300',
  monumento_natural:    'bg-purple-900/80 text-purple-300',
  santuario_naturaleza: 'bg-amber-900/80 text-amber-300',
  area_marina:          'bg-cyan-900/80 text-cyan-300',
  sitio_ramsar:         'bg-teal-900/80 text-teal-300',
  otro:                 'bg-zinc-700/80 text-zinc-300',
}

// ── Helpers ───────────────────────────────────────────────────

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-[#00E676] text-black'
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
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

// ── AreaCard ──────────────────────────────────────────────────

function MountainIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function AreaCard({ area, index }: { area: ProtectedAreaBasic; index: number }) {
  const badgeClass = TIPO_BADGE_COLORS[area.type] ?? 'bg-zinc-700/80 text-zinc-300'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
    >
      <Link href={`/areas-protegidas/${area.slug}`} className="group block">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group-hover:border-zinc-700 group-hover:scale-[1.02] transition-all duration-300 cursor-pointer">
          {/* Imagen */}
          <div className="relative h-48 w-full overflow-hidden">
            {area.photoUrl ? (
              <Image
                src={area.photoUrl}
                alt={area.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={75}
                loading="lazy"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-700">
                <MountainIcon />
              </div>
            )}

            {/* Overlay degradado */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />

            {/* Badge tipo — esquina sup izq */}
            <span className={`absolute top-3 left-3 text-[10px] font-medium rounded-full px-2.5 py-1 backdrop-blur-sm ${badgeClass}`}>
              {TIPO_LABELS[area.type] ?? area.type}
            </span>
          </div>

          {/* Contenido */}
          <div className="p-4 flex flex-col gap-1">
            <h2
              className="font-semibold text-white text-sm leading-snug line-clamp-2"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              {area.name}
            </h2>

            {area.regionName && (
              <p className="flex items-center gap-1 text-zinc-500 text-xs mt-0.5">
                <PinIcon />
                {area.regionName}
              </p>
            )}

            {area.areaHa && (
              <p className="text-zinc-600 text-xs">
                {Number(area.areaHa).toLocaleString('es-CL')} ha
              </p>
            )}

            {area.description && (
              <p className="text-zinc-400 text-xs mt-1 line-clamp-2">
                {area.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
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

  const [query, setQuery] = useState<string>(() => searchParams.get('q') ?? '')

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
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 mb-6 space-y-3">
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

        <FilterRow label="Tipo">
          <Chip active={tipos.length === 0} onClick={() => setTipos([])}>Todos</Chip>
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

        <FilterRow label="Zona">
          <Chip active={zonas.length === 0} onClick={() => setZonas([])}>Todos</Chip>
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
          <p className="text-sm text-zinc-500">
            <span className="font-semibold text-zinc-200">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'área encontrada' : 'áreas encontradas'}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            {areas.length} {areas.length === 1 ? 'área registrada' : 'áreas registradas'}
          </p>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-lg">Sin resultados</p>
          <p className="text-sm mt-1">Prueba con otros filtros o limpia la búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((area, index) => (
            <AreaCard key={area.slug} area={area} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
