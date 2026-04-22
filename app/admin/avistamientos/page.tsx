import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import { SightingModerationList, type PendingSighting } from '@/components/admin/SightingModerationList'
import { ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'angelperedajimenez@gmail.com'

export async function generateMetadata() {
  return { title: 'Moderación de avistamientos — Rayen' }
}

export default async function AdminAvistamientosPage() {
  const session = await auth()

  if (!session?.user?.email) redirect('/login?callbackUrl=/admin/avistamientos')

  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🚫</p>
        <h1 className="text-xl font-bold text-stone-800 mb-2">Acceso restringido</h1>
        <p className="text-stone-500 text-sm">No tienes permiso para acceder a esta sección.</p>
      </main>
    )
  }

  // Fetch pending sightings
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
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Moderación de avistamientos</h1>
          <p className="text-sm text-stone-500">
            {rows.length} pendiente{rows.length !== 1 ? 's' : ''} de verificación
          </p>
        </div>
      </div>

      <SightingModerationList initialSightings={rows} />
    </main>
  )
}
