import sql from '@/lib/db'
import { PetitionAdminPanel } from '@/components/admin/PetitionAdminPanel'

export const metadata = { title: 'Peticiones — Admin Rayen' }
export const dynamic = 'force-dynamic'

export default async function AdminPetitionsPage() {
  const petitions = await sql`
    SELECT
      p.id, p.slug, p.title, p.description,
      p.goal, p.signed_count AS "signedCount",
      p.active, p.image_url AS "imageUrl",
      p.ends_at AS "endsAt", p.created_at AS "createdAt",
      s.common_name AS "speciesName",
      s.slug        AS "speciesSlug"
    FROM petitions p
    LEFT JOIN species s ON s.id = p.species_id
    ORDER BY p.created_at DESC
  `

  return <PetitionAdminPanel initialPetitions={JSON.parse(JSON.stringify(petitions))} />
}
