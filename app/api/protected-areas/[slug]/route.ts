export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getProtectedAreaBySlug, getSightingsNearArea } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const [area, sightings] = await Promise.all([
      getProtectedAreaBySlug(params.slug),
      getSightingsNearArea(params.slug),
    ])

    if (!area) {
      return NextResponse.json({ error: 'Área no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ data: area, sightings })
  } catch (error) {
    console.error('[API/protected-areas/slug]', error)
    return NextResponse.json({ error: 'Error al obtener el área' }, { status: 500 })
  }
}
