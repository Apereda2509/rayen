import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

interface Props { params: { slug: string } }

export async function POST(_req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const [dbUser] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${session.user.email}`
  if (!dbUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const [species] = await sql<{ id: string }[]>`SELECT id FROM species WHERE slug = ${params.slug} AND published = TRUE`
  if (!species) return NextResponse.json({ error: 'Especie no encontrada' }, { status: 404 })

  const [existing] = await sql<{ id: string }[]>`
    SELECT id FROM species_favorites WHERE user_id = ${dbUser.id} AND species_id = ${species.id}
  `

  if (existing) {
    await sql`DELETE FROM species_favorites WHERE user_id = ${dbUser.id} AND species_id = ${species.id}`
    return NextResponse.json({ favorited: false })
  } else {
    await sql`INSERT INTO species_favorites (user_id, species_id) VALUES (${dbUser.id}, ${species.id}) ON CONFLICT DO NOTHING`
    return NextResponse.json({ favorited: true })
  }
}
