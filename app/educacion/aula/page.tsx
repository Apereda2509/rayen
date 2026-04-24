import Link from 'next/link'
import sql from '@/lib/db'
import { NivelSelector } from '@/components/educacion/NivelSelector'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aula — Educación | Rayen',
  description: 'Presentaciones adaptadas por nivel educativo sobre biodiversidad chilena. Modo pizarra incluido.',
}

async function getPresentaciones() {
  try {
    return await sql<{
      id: string; slug: string; titulo: string; nivel: string
      slides: unknown[]; species_common_name: string | null
    }[]>`
      SELECT
        p.id, p.slug, p.titulo, p.nivel, p.slides,
        s.common_name AS species_common_name
      FROM presentaciones p
      LEFT JOIN species s ON s.id = p.species_id
      WHERE p.published = TRUE
      ORDER BY p.nivel, p.created_at ASC
    `
  } catch {
    return []
  }
}

export default async function AulaPage() {
  const presentaciones = await getPresentaciones()

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">

        <nav className="text-xs text-zinc-600 mb-8 flex items-center gap-1.5">
          <Link href="/educacion" className="hover:text-zinc-400 transition-colors">Educación</Link>
          <span>/</span>
          <span className="text-zinc-400">Aula</span>
        </nav>

        <NivelSelector presentaciones={presentaciones} />
      </div>
    </div>
  )
}
