import { NextResponse } from 'next/server'
import sql from '@/lib/db'

interface Props { params: { username: string } }

export async function GET(_req: Request, { params }: Props) {
  const { username } = params

  const [user] = await sql<{ id: string }[]>`SELECT id FROM users WHERE username = ${username}`
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const photos = await sql<{
    id: string; url: string; license: string; favorites_count: number; created_at: string
    species_slug: string | null; species_common_name: string | null
    region_code: string | null; observed_at: string | null
  }[]>`
    SELECT
      p.id, p.url, p.license, p.favorites_count, p.created_at,
      s.slug AS species_slug, s.common_name AS species_common_name,
      sg.region_code, sg.observed_at
    FROM photos p
    LEFT JOIN species s ON s.id = p.species_id
    LEFT JOIN sightings sg ON sg.id = p.sighting_id
    WHERE p.user_id = ${user.id}
    ORDER BY p.created_at DESC
    LIMIT 100
  `

  return NextResponse.json(photos)
}
