'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Area {
  slug: string
  name: string
  type: string
}

interface Props {
  selected: Set<string>
  onChange: (slug: string) => void
  maxHeight?: string
}

const TYPE_LABELS: Record<string, string> = {
  parque_nacional:    'PN',
  reserva_nacional:   'RN',
  monumento_natural:  'MN',
  santuario_naturaleza: 'SN',
  area_marina:        'AMP',
  sitio_ramsar:       'Ramsar',
  otro:               'Otra',
}

export function AreaMultiSelect({ selected, onChange, maxHeight = '12rem' }: Props) {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/protected-areas')
      .then(r => r.json())
      .then(gj =>
        setAreas(
          gj.features
            .map((f: any) => ({ slug: f.properties.slug, name: f.properties.name, type: f.properties.type }))
            .sort((a: Area, b: Area) => a.name.localeCompare(b.name, 'es'))
        )
      )
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? areas.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    : areas

  return (
    <div className="mt-2 space-y-1.5">
      <input
        type="text"
        placeholder="Buscar área…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full text-xs rounded-md border border-stone-200 px-2 py-1.5 text-stone-700 placeholder:text-stone-400 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
      />

      {selected.size > 0 && (
        <p className="text-[10px] text-teal-600 font-medium">
          {selected.size} seleccionada{selected.size !== 1 ? 's' : ''}
        </p>
      )}

      {loading ? (
        <p className="text-xs text-stone-400 py-1">Cargando áreas…</p>
      ) : (
        <div
          className="flex flex-col gap-0.5 overflow-y-auto pr-0.5 scroll-thin"
          style={{ maxHeight }}
        >
          {filtered.map(area => (
            <label
              key={area.slug}
              className={cn(
                'flex items-center gap-2 cursor-pointer rounded px-1 py-0.5 transition-colors text-xs',
                selected.has(area.slug)
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-stone-700 hover:bg-stone-50'
              )}
            >
              <input
                type="checkbox"
                checked={selected.has(area.slug)}
                onChange={() => onChange(area.slug)}
                className="h-3 w-3 rounded border-stone-300 text-teal-600 focus:ring-teal-500 flex-shrink-0"
              />
              <span className="flex-1 truncate">{area.name}</span>
              <span className="text-[9px] text-stone-400 flex-shrink-0">{TYPE_LABELS[area.type] ?? ''}</span>
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-stone-400 py-1">Sin resultados</p>
          )}
        </div>
      )}
    </div>
  )
}
