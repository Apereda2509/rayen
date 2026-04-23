// app/api/admin/petitions/[id]/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

const ADMIN_EMAIL = 'angelperedajimenez@gmail.com'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { active } = body

  if (typeof active !== 'boolean') {
    return NextResponse.json({ error: 'active (boolean) requerido' }, { status: 400 })
  }

  const [updated] = await sql`
    UPDATE petitions
    SET active = ${active}
    WHERE id = ${params.id}
    RETURNING id, title, active
  `

  if (!updated) {
    return NextResponse.json({ error: 'Petición no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ data: updated })
}
