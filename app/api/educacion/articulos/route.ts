import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const rows = await sql<{
    id: string; slug: string; titulo: string; subtitulo: string | null
    imagen_url: string | null; tiempo_lectura: number; created_at: string
  }[]>`
    SELECT id, slug, titulo, subtitulo, imagen_url, tiempo_lectura, created_at
    FROM articulos
    WHERE published = TRUE
    ORDER BY created_at DESC
  `
  return NextResponse.json(rows)
}
