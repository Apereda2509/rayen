import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

const ADMIN_EMAIL = 'angelperedajimenez@gmail.com'

interface Props { params: { id: string } }

export async function POST(_req: Request, { params }: Props) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (session.user.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  await sql`
    UPDATE photos SET is_species_candidate = FALSE WHERE id = ${params.id}
  `
  return NextResponse.json({ ok: true })
}
