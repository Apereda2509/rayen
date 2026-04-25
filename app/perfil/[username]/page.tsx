import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import { PerfilClient } from '@/components/perfil/PerfilClient'

export const dynamic = 'force-dynamic'

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props) {
  return { title: `@${params.username} — Rayen` }
}

export default async function PerfilPublicoPage({ params }: Props) {
  const { username } = params

  const session = await auth()

  const [user] = await sql<{
    id: string; email: string; name: string; username: string | null
    bio: string | null; avatar_url: string | null; instagram: string | null
    linkedin: string | null; inaturalist: string | null; twitter: string | null
    website: string | null; role: string; created_at: string
  }[]>`
    SELECT id, email, name, username, bio, avatar_url, instagram, linkedin,
           inaturalist, twitter, website, role::text, created_at
    FROM users WHERE username = ${username}
  `

  if (!user) notFound()

  if (session?.user?.email === user.email) {
    redirect('/perfil')
  }

  const [
    [{ sightings_count }],
    [{ unique_species_count }],
    [{ regions_count }],
  ] = await Promise.all([
    sql<{ sightings_count: number }[]>`
      SELECT COUNT(*)::int AS sightings_count FROM sightings WHERE user_id = ${user.id} AND verified = TRUE
    `,
    sql<{ unique_species_count: number }[]>`
      SELECT COUNT(DISTINCT species_id)::int AS unique_species_count
      FROM sightings WHERE user_id = ${user.id} AND verified = TRUE
    `,
    sql<{ regions_count: number }[]>`
      SELECT COUNT(DISTINCT region_code)::int AS regions_count
      FROM sightings WHERE user_id = ${user.id} AND verified = TRUE AND region_code IS NOT NULL
    `,
  ])

  const photos = await sql<{
    id: string; url: string; license: string; favorites_count: number; created_at: string
    species_slug: string | null; species_common_name: string | null
    region_code: string | null; observed_at: string | null
  }[]>`
    SELECT p.id, p.url, p.license, p.favorites_count, p.created_at,
           s.slug AS species_slug, s.common_name AS species_common_name,
           sg.region_code, sg.observed_at
    FROM photos p
    LEFT JOIN species s ON s.id = p.species_id
    LEFT JOIN sightings sg ON sg.id = p.sighting_id
    WHERE p.user_id = ${user.id}
    ORDER BY p.created_at DESC LIMIT 100
  `

  const speciesFavorites = await sql<{
    id: string; slug: string; commonName: string; scientificName: string
    type: string; uicnStatus: string | null; primaryPhoto: string | null; isEndemic: boolean
  }[]>`
    SELECT s.id, s.slug, s.common_name AS "commonName", s.scientific_name AS "scientificName",
           s.type::text, s.uicn_status::text AS "uicnStatus", s.is_endemic AS "isEndemic",
           (SELECT url FROM media WHERE species_id = s.id AND is_primary = TRUE LIMIT 1) AS "primaryPhoto"
    FROM species_favorites sf JOIN species s ON s.id = sf.species_id
    WHERE sf.user_id = ${user.id} ORDER BY sf.created_at DESC
  `

  const sightings = await sql<{
    id: string; observed_at: string; verified: boolean; region_code: string | null
    photo_url: string | null; notes: string | null
    commonName: string; scientificName: string; speciesSlug: string
    uicnStatus: string | null
  }[]>`
    SELECT sg.id, sg.observed_at, sg.verified, sg.region_code, sg.photo_url, sg.notes,
           s.common_name AS "commonName", s.scientific_name AS "scientificName",
           s.slug AS "speciesSlug", s.uicn_status::text AS "uicnStatus"
    FROM sightings sg JOIN species s ON s.id = sg.species_id
    WHERE sg.user_id = ${user.id} AND sg.verified = TRUE
    ORDER BY sg.created_at DESC LIMIT 50
  `

  // Peticiones firmadas (sección pública)
  const signedPetitions = await sql<{ id: string; slug: string; title: string }[]>`
    SELECT p.id, p.slug, p.title
    FROM petition_signatures ps
    JOIN petitions p ON p.id = ps.petition_id
    WHERE ps.user_id = ${user.id}::uuid AND p.active = TRUE
    ORDER BY ps.created_at DESC
  `

  return (
    <PerfilClient
      user={user}
      sessionEmail={session?.user?.email ?? undefined}
      stats={{ sightings_count, unique_species_count, regions_count }}
      photos={photos}
      speciesFavorites={speciesFavorites}
      sightings={sightings}
      signedPetitions={signedPetitions}
      isOwner={false}
    />
  )
}
