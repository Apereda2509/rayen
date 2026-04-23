export const revalidate = 3600

import Link from 'next/link'
import Image from 'next/image'
import { getProtectedAreas } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Áreas Protegidas de Chile',
  description: 'Explora los parques nacionales, reservas nacionales y monumentos naturales de Chile administrados por CONAF.',
}

const TIPO_LABELS: Record<string, string> = {
  parque_nacional: 'Parque Nacional',
  reserva_nacional: 'Reserva Nacional',
  monumento_natural: 'Monumento Natural',
  santuario_naturaleza: 'Santuario de la Naturaleza',
  area_marina: 'Área Marina Protegida',
  sitio_ramsar: 'Sitio Ramsar',
  otro: 'Otra',
}

const TIPO_COLORS: Record<string, string> = {
  parque_nacional: 'bg-emerald-100 text-emerald-800',
  reserva_nacional: 'bg-teal-100 text-teal-800',
  monumento_natural: 'bg-amber-100 text-amber-800',
  santuario_naturaleza: 'bg-sky-100 text-sky-800',
  area_marina: 'bg-blue-100 text-blue-800',
  sitio_ramsar: 'bg-cyan-100 text-cyan-800',
  otro: 'bg-stone-100 text-stone-600',
}

const TIPOS_FILTER = [
  { value: '', label: 'Todos los tipos' },
  { value: 'parque_nacional', label: 'Parques Nacionales' },
  { value: 'reserva_nacional', label: 'Reservas Nacionales' },
  { value: 'monumento_natural', label: 'Monumentos Naturales' },
]

interface Props {
  searchParams: { tipo?: string; region?: string }
}

export default async function AreasProtegidasPage({ searchParams }: Props) {
  let all: Awaited<ReturnType<typeof getProtectedAreas>> = []
  try {
    all = await getProtectedAreas()
  } catch (e) {
    console.error('[areas-protegidas]', e)
  }

  const tipoFilter = searchParams.tipo ?? ''
  const regionFilter = searchParams.region ?? ''

  const filtered = all.filter(a => {
    if (tipoFilter && a.type !== tipoFilter) return false
    if (regionFilter && !a.regionName?.toLowerCase().includes(regionFilter.toLowerCase())) return false
    return true
  })

  // Obtener regiones únicas para el filtro
  const regions = [...new Set(all.map(a => a.regionName).filter(Boolean))].sort() as string[]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Áreas Protegidas de Chile</h1>
        <p className="mt-2 text-stone-500 max-w-2xl">
          El Sistema Nacional de Áreas Silvestres Protegidas del Estado (SNASPE) administrado por CONAF
          protege más de 19 millones de hectáreas de ecosistemas únicos.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total áreas', value: all.length },
          { label: 'Parques Nacionales', value: all.filter(a => a.type === 'parque_nacional').length },
          { label: 'Reservas Nacionales', value: all.filter(a => a.type === 'reserva_nacional').length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">{value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap gap-3 mb-8">
        <select
          name="tipo"
          defaultValue={tipoFilter}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {TIPOS_FILTER.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          name="region"
          defaultValue={regionFilter}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-xs"
        >
          <option value="">Todas las regiones</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          Filtrar
        </button>

        {(tipoFilter || regionFilter) && (
          <Link
            href="/areas-protegidas"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Limpiar
          </Link>
        )}
      </form>

      {/* Conteo */}
      <p className="text-sm text-stone-500 mb-5">
        {filtered.length} {filtered.length === 1 ? 'área' : 'áreas'} encontradas
      </p>

      {/* Grid de tarjetas */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-4xl mb-3">🌿</p>
          <p>No se encontraron áreas con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((area) => (
            <Link
              key={area.slug}
              href={`/areas-protegidas/${area.slug}`}
              className="group rounded-2xl border border-stone-200 bg-white overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all"
            >
              {/* Cabecera con foto o gradiente fallback */}
              <div className="h-40 relative overflow-hidden flex items-end p-3">
                {area.photoUrl ? (
                  <Image
                    src={area.photoUrl}
                    alt={area.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-teal-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className={`relative z-10 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${TIPO_COLORS[area.type] ?? 'bg-stone-100 text-stone-600'}`}>
                  {TIPO_LABELS[area.type] ?? area.type}
                </span>
              </div>

              <div className="p-4">
                <h2 className="font-semibold text-stone-900 group-hover:text-teal-700 transition-colors leading-tight">
                  {area.name}
                </h2>
                {area.regionName && (
                  <p className="text-xs text-stone-500 mt-1">📍 {area.regionName}</p>
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
    </main>
  )
}
