'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { SpeciesCard } from '@/components/species/SpeciesCard'
import type { SpeciesSummary, UICNStatus, SpeciesType } from '@/lib/types'
import { cn } from '@/lib/utils'

type UICNFilter = 'all' | UICNStatus
type TypeFilter = 'all' | SpeciesType
type OriginFilter = 'all' | 'endemica'

const UICN_OPTIONS: { value: UICNFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'CR', label: 'CR' },
  { value: 'EN', label: 'EN' },
  { value: 'VU', label: 'VU' },
  { value: 'NT', label: 'NT' },
  { value: 'LC', label: 'LC' },
]

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all',      label: 'Todos' },
  { value: 'mamifero', label: 'Mamífero' },
  { value: 'ave',      label: 'Ave' },
  { value: 'reptil',   label: 'Reptil' },
  { value: 'anfibio',  label: 'Anfibio' },
  { value: 'pez',      label: 'Pez' },
  { value: 'insecto',  label: 'Insecto' },
  { value: 'planta',   label: 'Planta' },
  { value: 'hongo',    label: 'Hongo' },
]

const ORIGIN_OPTIONS: { value: OriginFilter; label: string }[] = [
  { value: 'all',      label: 'Todos' },
  { value: 'endemica', label: 'Endémica' },
]

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
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide flex-shrink-0 w-14">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {children}
      </div>
    </div>
  )
}

interface Props {
  species: SpeciesSummary[]
  total: number
}

export function SpeciesFilterGrid({ species, total }: Props) {
  const [uicn, setUicn] = useState<UICNFilter>('all')
  const [type, setType] = useState<TypeFilter>('all')
  const [origin, setOrigin] = useState<OriginFilter>('all')
  const [query, setQuery] = useState('')

  const hasFilters = uicn !== 'all' || type !== 'all' || origin !== 'all' || query.trim() !== ''

  function clearFilters() {
    setUicn('all')
    setType('all')
    setOrigin('all')
    setQuery('')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return species.filter((sp) => {
      if (uicn !== 'all' && sp.uicnStatus !== uicn) return false
      if (type !== 'all' && sp.type !== type) return false
      if (origin === 'endemica' && !sp.isEndemic) return false
      if (q && !sp.commonName.toLowerCase().includes(q) && !sp.scientificName.toLowerCase().includes(q)) return false
      return true
    })
  }, [species, uicn, type, origin, query])

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
            placeholder="Buscar por nombre común o científico…"
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

        {/* Estado UICN */}
        <FilterRow label="Estado">
          {UICN_OPTIONS.map((opt) => (
            <Chip key={opt.value} active={uicn === opt.value} onClick={() => setUicn(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </FilterRow>

        {/* Tipo */}
        <FilterRow label="Tipo">
          {TYPE_OPTIONS.map((opt) => (
            <Chip key={opt.value} active={type === opt.value} onClick={() => setType(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </FilterRow>

        {/* Origen */}
        <FilterRow label="Origen">
          {ORIGIN_OPTIONS.map((opt) => (
            <Chip key={opt.value} active={origin === opt.value} onClick={() => setOrigin(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {/* Conteo + limpiar */}
      <div className="flex items-center justify-between mb-5 min-h-[24px]">
        {hasFilters ? (
          <p className="text-sm text-stone-500">
            <span className="font-semibold text-stone-800">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'especie encontrada' : 'especies encontradas'}
          </p>
        ) : (
          <p className="text-sm text-stone-500">
            {total} {total === 1 ? 'especie registrada' : 'especies registradas'}
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

      {/* Grilla */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">Sin resultados</p>
          <p className="text-sm mt-1">Prueba con otros filtros o limpia la búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((sp) => (
            <SpeciesCard key={sp.id} species={sp} variant="card" />
          ))}
        </div>
      )}
    </div>
  )
}
