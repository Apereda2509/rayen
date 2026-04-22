import { NextResponse } from 'next/server'
import sql from '@/lib/db'

interface Props { params: { username: string } }

export async function GET(_req: Request, { params }: Props) {
  const { username } = params

  const [user] = await sql<{
    id: string; name: string; username: string; bio: string | null
    avatar_url: string | null; instagram: string | null; linkedin: string | null
    inaturalist: string | null; twitter: string | null; website: string | null
    created_at: string
  }[]>`
    SELECT id, name, username, bio, avatar_url, instagram, linkedin,
           inaturalist, twitter, website, created_at
    FROM users WHERE username = ${username}
  `

  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const [{ sightings_count }] = await sql<{ sightings_count: number }[]>`
    SELECT COUNT(*)::int AS sightings_count FROM sightings WHERE user_id = ${user.id} AND verified = TRUE
  `
  const [{ species_fav_count }] = await sql<{ species_fav_count: number }[]>`
    SELECT COUNT(*)::int AS species_fav_count FROM species_favorites WHERE user_id = ${user.id}
  `
  const [{ photos_count }] = await sql<{ photos_count: number }[]>`
    SELECT COUNT(*)::int AS photos_count FROM photos WHERE user_id = ${user.id}
  `

  return NextResponse.json({ ...user, sightings_count, species_fav_count, photos_count })
}
