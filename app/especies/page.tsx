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
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Especies</h1>
      </div>

      {dbError ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg font-medium text-stone-600">Error temporal al cargar las especies</p>
          <p className="text-sm mt-1">Hubo un problema con la base de datos. Inténtalo de nuevo en unos segundos.</p>
        </div>
      ) : species.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">No hay especies publicadas aún.</p>
        </div>
      ) : (
        <Suspense>
          <SpeciesFilterGrid species={species} total={total} />
        </Suspense>
      )}
    </main>
  )
}
