export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSightingsBySpecies } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('dateFrom') ?? undefined
    const dateTo = searchParams.get('dateTo') ?? undefined
    const regionCode = searchParams.get('region') ?? undefined

    const data = await getSightingsBySpecies(params.slug, { dateFrom, dateTo, regionCode })
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[sightings] Error:', err)
    return NextResponse.json({ error: 'Error al obtener avistamientos' }, { status: 500 })
  }
}
