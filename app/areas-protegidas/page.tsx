export const dynamic = 'force-dynamic'

import { getProtectedAreas } from '@/lib/db'
import { AreasFilterGrid } from '@/components/areas/AreasFilterGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Áreas Protegidas de Chile',
  description: 'Explora los parques nacionales, reservas nacionales y monumentos naturales de Chile administrados por CONAF.',
}

export default async function AreasProtegidasPage() {
  let areas: Awaited<ReturnType<typeof getProtectedAreas>> = []
  try {
    areas = await getProtectedAreas()
  } catch (e) {
    console.error('[areas-protegidas]', e)
  }

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

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total áreas', value: areas.length },
          { label: 'Parques Nacionales', value: areas.filter((a) => a.type === 'parque_nacional').length },
          { label: 'Santuarios', value: areas.filter((a) => a.type === 'santuario_naturaleza').length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-stone-800">{value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Buscador + filtros + grid */}
      <AreasFilterGrid areas={areas} />
    </main>
  )
}
