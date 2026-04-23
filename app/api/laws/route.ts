// app/api/laws/route.ts
export const runtime = 'nodejs'
export const revalidate = 3600 // 1 hora — las leyes no cambian frecuente

import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const laws = await sql`
      SELECT
        id,
        name,
        number,
        year,
        type,
        description,
        url
      FROM laws
      ORDER BY year DESC
    `

    return NextResponse.json({ data: laws })
  } catch (err) {
    console.error('[API/laws] GET error:', err)
    return NextResponse.json({ error: 'Error al obtener leyes' }, { status: 500 })
  }
}
