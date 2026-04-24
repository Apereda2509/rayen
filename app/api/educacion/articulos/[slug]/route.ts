import { NextResponse } from 'next/server'
import sql from '@/lib/db'

interface Props { params: { slug: string } }

export async function GET(_req: Request, { params }: Props) {
  const [row] = await sql<{
    id: string; slug: string; titulo: string; subtitulo: string | null
    contenido: string; imagen_url: string | null; tiempo_lectura: number; created_at: string
  }[]>`
    SELECT id, slug, titulo, subtitulo, contenido, imagen_url, tiempo_lectura, created_at
    FROM articulos
    WHERE slug = ${params.slug} AND published = TRUE
  `
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(row)
}
