import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

const ADMIN_EMAIL = 'angelperedajimenez@gmail.com'

interface Props { params: { id: string } }

export async function POST(_req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (session.user.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const [adminUser] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${ADMIN_EMAIL}`

  const [photo] = await sql<{ id: string; species_id: string }[]>`
    SELECT id, species_id FROM photos WHERE id = ${params.id} AND is_species_candidate = TRUE
  `
  if (!photo) return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 })

  await sql`
    UPDATE photos SET
      candidate_approved = TRUE,
      candidate_approved_by = ${adminUser?.id ?? null},
      candidate_approved_at = NOW()
    WHERE id = ${params.id}
  `

  return NextResponse.json({ ok: true })
}
