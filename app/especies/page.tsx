import { getSpeciesSummaries } from '@/lib/db'
import { SpeciesCard } from '@/components/species/SpeciesCard'

export const metadata = {
  title: 'Especies — Rayen',
  description: 'Catálogo de biodiversidad chilena. Explora mamíferos, aves, plantas y más.',
}

export const revalidate = 300

export default async function EspeciesPage() {
  const { data: species, total } = await getSpeciesSummaries({ limit: 100 })

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Especies</h1>
        <p className="mt-1 text-stone-500">
          {total} {total === 1 ? 'especie registrada' : 'especies registradas'} en la plataforma
        </p>
      </div>

      {/* Grilla de tarjetas */}
      {species.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">No hay especies publicadas aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {species.map((sp) => (
            <SpeciesCard key={sp.id} species={sp} variant="card" />
          ))}
        </div>
      )}
    </main>
  )
}
