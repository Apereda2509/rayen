export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getProtectedAreas } from '@/lib/db'
import { AreasFilterGrid } from '@/components/areas/AreasFilterGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Áreas Protegidas de Chile',
  description: 'Parques nacionales, reservas y santuarios de la naturaleza de Chile. Explora las áreas protegidas por región y tipo.',
}

export default async function AreasProtegidasPage() {
  let areas: Awaited<ReturnType<typeof getProtectedAreas>> = []
  try {
    areas = await getProtectedAreas()
  } catch (e) {
    console.error('[areas-protegidas]', e)
  }

  const stats = [
    { label: 'Total áreas', value: areas.length },
    { label: 'Parques Nacionales', value: areas.filter((a) => a.type === 'parque_nacional').length },
    { label: 'Santuarios', value: areas.filter((a) => a.type === 'santuario_naturaleza').length },
  ]

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Header editorial */}
        <div className="mb-12">
          <h1
            className="font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}
          >
            Áreas protegidas<br />de Chile
          </h1>
          <p className="text-zinc-400 text-lg mt-4 max-w-2xl leading-relaxed">
            Parques nacionales, reservas y santuarios. Más de 19 millones de hectáreas protegidas en todo el territorio nacional.
          </p>

          {/* Stats como chips oscuros */}
          <div className="flex flex-wrap gap-4 mt-8">
            {stats.map(({ label, value }) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3">
                <p
                  className="font-bold text-2xl text-[#00E676]"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  {value}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buscador + filtros + grid */}
        <Suspense>
          <AreasFilterGrid areas={areas} />
        </Suspense>
      </main>
    </div>
  )
}
