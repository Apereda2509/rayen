import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

interface Props { params: { id: string } }

export async function POST(_req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const [dbUser] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${session.user.email}`
  if (!dbUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const [photo] = await sql<{ id: string }[]>`SELECT id FROM photos WHERE id = ${params.id}`
  if (!photo) return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 })

  // Toggle
  const [existing] = await sql<{ id: string }[]>`
    SELECT id FROM photo_favorites WHERE user_id = ${dbUser.id} AND photo_id = ${params.id}
  `

  if (existing) {
    await sql`DELETE FROM photo_favorites WHERE user_id = ${dbUser.id} AND photo_id = ${params.id}`
    await sql`UPDATE photos SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = ${params.id}`
    return NextResponse.json({ favorited: false })
  } else {
    await sql`INSERT INTO photo_favorites (user_id, photo_id) VALUES (${dbUser.id}, ${params.id}) ON CONFLICT DO NOTHING`
    await sql`UPDATE photos SET favorites_count = favorites_count + 1 WHERE id = ${params.id}`
    return NextResponse.json({ favorited: true })
  }
}
