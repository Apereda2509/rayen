import sql from '@/lib/db'
import { PhotoCandidatesList, type PhotoCandidate } from '@/components/admin/PhotoCandidatesList'

export const metadata = { title: 'Fotos candidatas — Admin Rayen' }

export default async function AdminFotosPage() {
  const candidates = await sql<PhotoCandidate[]>`
    SELECT
      p.id, p.url,
      p.favorites_count AS "favoritesCount",
      p.created_at      AS "createdAt",
      s.common_name     AS "speciesCommonName",
      s.scientific_name AS "speciesScientificName",
      s.slug            AS "speciesSlug",
      u.name            AS "userName"
    FROM photos p
    JOIN species s ON s.id = p.species_id
    JOIN users u ON u.id = p.user_id
    WHERE p.is_species_candidate = TRUE AND p.candidate_approved = FALSE
    ORDER BY p.created_at DESC
    LIMIT 100
  `

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-900">Fotos candidatas a especie</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {candidates.length} pendiente{candidates.length !== 1 ? 's' : ''} de aprobación
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center text-stone-400">
          <p className="text-4xl mb-3">📷</p>
          <p className="font-medium">No hay fotos candidatas pendientes</p>
        </div>
      ) : (
        <PhotoCandidatesList initialCandidates={candidates} />
      )}
    </div>
  )
}
