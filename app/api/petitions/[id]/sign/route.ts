// app/api/petitions/[id]/sign/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.dbId) {
    return NextResponse.json(
      { error: 'Debes iniciar sesión para firmar esta petición' },
      { status: 401 }
    )
  }

  const petitionId = params.id
  const userId = session.user.dbId

  // Verificar que la petición existe y está activa
  const [petition] = await sql<{ id: string; signedCount: number; goal: number }[]>`
    SELECT id, signed_count AS "signedCount", goal
    FROM petitions
    WHERE id = ${petitionId} AND active = TRUE
  `

  if (!petition) {
    return NextResponse.json({ error: 'Petición no encontrada o inactiva' }, { status: 404 })
  }

  // Intentar insertar firma (UNIQUE constraint maneja duplicados)
  try {
    await sql`
      INSERT INTO petition_signatures (petition_id, user_id)
      VALUES (${petitionId}, ${userId}::uuid)
    `

    // El trigger actualiza signed_count automáticamente. Leer valor nuevo.
    const [updated] = await sql<{ signedCount: number }[]>`
      SELECT signed_count AS "signedCount" FROM petitions WHERE id = ${petitionId}
    `

    return NextResponse.json({
      success: true,
      signedCount: updated.signedCount,
    })
  } catch (err: unknown) {
    // Código 23505 = unique_violation (ya firmó)
    if ((err as { code?: string })?.code === '23505') {
      return NextResponse.json(
        { error: 'already_signed', message: 'Ya has firmado esta petición' },
        { status: 409 }
      )
    }
    console.error('[API/petitions/sign] Error:', err)
    return NextResponse.json({ error: 'Error al registrar la firma' }, { status: 500 })
  }
}
