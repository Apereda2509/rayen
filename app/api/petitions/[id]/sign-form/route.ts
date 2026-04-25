export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { auth } from '@/auth'
import sql from '@/lib/db'

function sha256(text: string): string {
  return createHash('sha256').update(text.trim().toLowerCase()).digest('hex')
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth()
  const userId = session?.user?.dbId ?? null

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { nombres, apellidos, rut, correo, region, razon } = body

  if (!nombres?.trim() || !apellidos?.trim() || !rut?.trim() || !correo?.trim() || !region?.trim()) {
    return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
  }

  const petitionId = params.id

  const [petition] = await sql<{ id: string }[]>`
    SELECT id FROM petitions WHERE id = ${petitionId} AND active = TRUE
  `
  if (!petition) {
    return NextResponse.json({ error: 'Petición no encontrada o inactiva' }, { status: 404 })
  }

  // Hash del RUT normalizado (sin puntos ni guión, minúsculas)
  const rutNorm = rut.replace(/\./g, '').replace(/-/g, '').toLowerCase()
  const rutHash = sha256(rutNorm)
  const correoHash = sha256(correo)

  try {
    if (userId) {
      await sql`
        INSERT INTO petition_signatures
          (petition_id, user_id, nombres, apellidos, rut_hash, correo_hash, region, razon)
        VALUES
          (${petitionId}, ${userId}::uuid, ${nombres.trim()}, ${apellidos.trim()},
           ${rutHash}, ${correoHash}, ${region.trim()}, ${razon ?? null})
      `
    } else {
      await sql`
        INSERT INTO petition_signatures
          (petition_id, nombres, apellidos, rut_hash, correo_hash, region, razon)
        VALUES
          (${petitionId}, ${nombres.trim()}, ${apellidos.trim()},
           ${rutHash}, ${correoHash}, ${region.trim()}, ${razon ?? null})
      `
    }

    const [updated] = await sql<{ signedCount: number }[]>`
      SELECT signed_count AS "signedCount" FROM petitions WHERE id = ${petitionId}
    `

    return NextResponse.json({ success: true, signedCount: updated.signedCount })
  } catch (err: unknown) {
    const e = err as { code?: string; detail?: string }
    if (e.code === '23505') {
      const detail = e.detail ?? ''
      if (detail.includes('rut_hash') || detail.includes('idx_petition_sigs_rut')) {
        return NextResponse.json(
          { error: 'rut_already_signed', message: 'Ya registraste una firma con este RUT' },
          { status: 409 },
        )
      }
      if (detail.includes('correo_hash') || detail.includes('idx_petition_sigs_correo')) {
        return NextResponse.json(
          { error: 'email_already_signed', message: 'Ya registraste una firma con este correo' },
          { status: 409 },
        )
      }
      return NextResponse.json(
        { error: 'already_signed', message: 'Ya has firmado esta petición' },
        { status: 409 },
      )
    }
    console.error('[API/petitions/sign-form] Error:', err)
    return NextResponse.json({ error: 'Error al registrar la firma' }, { status: 500 })
  }
}
