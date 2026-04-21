// app/api/species/[slug]/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getSpeciesBySlug } from '@/lib/db'
export const revalidate = 600 // 10 minutos de caché

interface Params {
  params: { slug: string }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const species = await getSpeciesBySlug(params.slug)

    if (!species) {
      return NextResponse.json(
        { error: 'Especie no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: species })

  } catch (error) {
    console.error(`[API/species/${params.slug}] Error:`, error)
    return NextResponse.json(
      { error: 'Error al obtener la especie' },
      { status: 500 }
    )
  }
}
