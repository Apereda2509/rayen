import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const [dbUser] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${session.user.email}`
  if (!dbUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const favorites = await sql<{
    id: string; slug: string; commonName: string; scientificName: string
    type: string; uicnStatus: string | null; primaryPhoto: string | null
    isEndemic: boolean; favoritedAt: string
  }[]>`
    SELECT
      s.id, s.slug,
      s.common_name AS "commonName",
      s.scientific_name AS "scientificName",
      s.type::text,
      s.uicn_status::text AS "uicnStatus",
      s.is_endemic AS "isEndemic",
      (SELECT url FROM media WHERE species_id = s.id AND is_primary = TRUE LIMIT 1) AS "primaryPhoto",
      sf.created_at AS "favoritedAt"
    FROM species_favorites sf
    JOIN species s ON s.id = sf.species_id
    WHERE sf.user_id = ${dbUser.id}
    ORDER BY sf.created_at DESC
  `

  return NextResponse.json(favorites)
}
