import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

const ADMIN_EMAIL = 'angelperedajimenez@gmail.com'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  }

  const { action } = (await req.json()) as { action: 'approve' | 'reject' }
  const { id } = params

  if (action === 'approve') {
    const [admin] = await sql<{ id: string }[]>`
      SELECT id FROM users WHERE email = ${ADMIN_EMAIL}
    `
    await sql`
      UPDATE sightings
      SET verified = TRUE, verified_by = ${admin?.id ?? null}, verified_at = NOW()
      WHERE id = ${id}
    `
    return NextResponse.json({ ok: true })
  }

  if (action === 'reject') {
    await sql`DELETE FROM sightings WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 })
}
