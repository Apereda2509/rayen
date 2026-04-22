import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const speciesSlug = searchParams.get('species') ?? undefined
  const orderBy     = searchParams.get('order') === 'popular' ? 'popular' : 'recent'
  const page        = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit       = 20
  const offset      = (page - 1) * limit

  const session = await auth()
  let dbUserId: string | null = null
  if (session?.user?.email) {
    const [u] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${session.user.email}`
    dbUserId = u?.id ?? null
  }

  const rows = await sql<{
    id: string; url: string; license: string; favorites_count: number; created_at: string
    species_slug: string; species_common_name: string; species_scientific_name: string
    region_code: string | null; observed_at: string | null
    user_username: string | null; user_name: string; user_avatar: string | null
    viewer_favorited: boolean
  }[]>`
    SELECT
      p.id, p.url, p.license, p.favorites_count, p.created_at,
      s.slug AS species_slug, s.common_name AS species_common_name, s.scientific_name AS species_scientific_name,
      sg.region_code, sg.observed_at,
      u.username AS user_username, u.name AS user_name, u.avatar_url AS user_avatar,
      ${dbUserId
        ? sql`EXISTS(SELECT 1 FROM photo_favorites pf WHERE pf.photo_id = p.id AND pf.user_id = ${dbUserId}) AS viewer_favorited`
        : sql`FALSE AS viewer_favorited`}
    FROM photos p
    JOIN sightings sg ON sg.id = p.sighting_id
    JOIN species s ON s.id = p.species_id
    JOIN users u ON u.id = p.user_id
    WHERE sg.verified = TRUE
      ${speciesSlug ? sql`AND s.slug = ${speciesSlug}` : sql``}
    ORDER BY ${orderBy === 'popular' ? sql`p.favorites_count DESC, p.created_at DESC` : sql`p.created_at DESC`}
    LIMIT ${limit} OFFSET ${offset}
  `

  const [{ total }] = await sql<{ total: number }[]>`
    SELECT COUNT(*)::int AS total
    FROM photos p
    JOIN sightings sg ON sg.id = p.sighting_id
    JOIN species s ON s.id = p.species_id
    WHERE sg.verified = TRUE
      ${speciesSlug ? sql`AND s.slug = ${speciesSlug}` : sql``}
  `

  return NextResponse.json({
    photos: rows,
    total,
    page,
    hasMore: offset + rows.length < total,
  })
}
