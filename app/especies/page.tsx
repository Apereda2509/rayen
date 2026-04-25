export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getSpeciesSummaries } from '@/lib/db'
import { SpeciesFilterGrid } from '@/components/especies/SpeciesFilterGrid'

export const metadata = {
  title: 'Especies — Fauna y Flora de Chile',
  description: 'Explora las especies nativas y endémicas de Chile. Fichas verificadas con estado de conservación UICN, distribución y amenazas.',
}

export default async function EspeciesPage() {
  let species: Awaited<ReturnType<typeof getSpeciesSummaries>>['data'] = []
  let total = 0
  let dbError = false

  try {
    const result = await getSpeciesSummaries({ limit: 200 })
    species = result.data
    total = result.total
  } catch (err) {
    console.error('[especies]', err instanceof Error ? err.message : err)
    dbError = true
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1
            className="font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}
          >
            Fauna y flora<br />de Chile
          </h1>
          <p className="text-zinc-400 text-lg mt-4 max-w-2xl leading-relaxed">
            Explora las especies nativas y endémicas de Chile. Fichas verificadas con estado de conservación UICN, distribución y amenazas.
          </p>
        </div>

        {dbError ? (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-lg font-medium text-zinc-400">Error temporal al cargar las especies</p>
            <p className="text-sm mt-1">Hubo un problema con la base de datos. Inténtalo de nuevo en unos segundos.</p>
          </div>
        ) : species.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-lg">No hay especies publicadas aún.</p>
          </div>
        ) : (
          <Suspense>
            <SpeciesFilterGrid species={species} total={total} />
          </Suspense>
        )}
      </main>
    </div>
  )
}
