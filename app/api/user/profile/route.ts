import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const [user] = await sql<{
    id: string; email: string; name: string; username: string | null
    bio: string | null; avatar_url: string | null; instagram: string | null
    linkedin: string | null; inaturalist: string | null; twitter: string | null
    website: string | null; onboarding_completed: boolean; role: string
    created_at: string
  }[]>`
    SELECT id, email, name, username, bio, avatar_url, instagram, linkedin,
           inaturalist, twitter, website, onboarding_completed, role::text, created_at
    FROM users WHERE email = ${session.user.email}
  `

  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const [{ sightings_count }] = await sql<{ sightings_count: number }[]>`
    SELECT COUNT(*)::int AS sightings_count FROM sightings WHERE user_id = ${user.id}
  `
  const [{ species_fav_count }] = await sql<{ species_fav_count: number }[]>`
    SELECT COUNT(*)::int AS species_fav_count FROM species_favorites WHERE user_id = ${user.id}
  `

  return NextResponse.json({ ...user, sightings_count, species_fav_count })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await req.json()
  const { name, bio, instagram, linkedin, inaturalist, twitter, website } = body

  const [updated] = await sql<{ id: string; name: string; username: string | null; bio: string | null }[]>`
    UPDATE users SET
      name        = COALESCE(${name ?? null}, name),
      bio         = ${bio ?? null},
      instagram   = ${instagram ?? null},
      linkedin    = ${linkedin ?? null},
      inaturalist = ${inaturalist ?? null},
      twitter     = ${twitter ?? null},
      website     = ${website ?? null}
    WHERE email = ${session.user.email}
    RETURNING id, name, username, bio
  `

  return NextResponse.json(updated)
}
