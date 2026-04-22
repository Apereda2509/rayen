import sql from '@/lib/db'
import { SightingModerationList, type PendingSighting } from '@/components/admin/SightingModerationList'

export const metadata = { title: 'Avistamientos — Admin Rayen' }

export default async function AdminAvistamientosPage() {
  const rows = await sql<(PendingSighting & { observedAt: string })[]>`
    SELECT
      sg.id,
      sg.observed_at        AS "observedAt",
      sg.photo_url          AS "photoUrl",
      sg.notes,
      sg.created_at         AS "createdAt",
      ST_Y(sg.location::geometry) AS lat,
      ST_X(sg.location::geometry) AS lng,
      s.common_name         AS "commonName",
      s.scientific_name     AS "scientificName",
      s.slug                AS "speciesSlug",
      u.name                AS "userName",
      u.email               AS "userEmail",
      u.avatar_url          AS "userAvatar"
    FROM sightings sg
    JOIN species s ON s.id = sg.species_id
    LEFT JOIN users u ON u.id = sg.user_id
    WHERE sg.verified = FALSE
    ORDER BY sg.created_at DESC
    LIMIT 100
  `

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-900">Avistamientos pendientes</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {rows.length} pendiente{rows.length !== 1 ? 's' : ''} de verificación
        </p>
      </div>
      <SightingModerationList initialSightings={rows} />
    </div>
  )
}
