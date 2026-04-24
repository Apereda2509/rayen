import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const rows = await sql<{
    id: string; termino: string; definicion: string; nivel: string
  }[]>`
    SELECT id, termino, definicion, nivel
    FROM glosario
    ORDER BY termino ASC
  `
  return NextResponse.json(rows)
}
