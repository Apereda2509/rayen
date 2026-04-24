import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nivel = searchParams.get('nivel')

  const rows = await sql<{
    id: string; slug: string; titulo: string; nivel: string
    slides: unknown[]; species_id: string | null
    species_common_name: string | null
  }[]>`
    SELECT
      p.id, p.slug, p.titulo, p.nivel, p.slides, p.species_id,
      s.common_name AS species_common_name
    FROM presentaciones p
    LEFT JOIN species s ON s.id = p.species_id
    WHERE p.published = TRUE
      ${nivel ? sql`AND p.nivel = ${nivel}` : sql``}
    ORDER BY p.created_at ASC
  `
  return NextResponse.json(rows)
}
