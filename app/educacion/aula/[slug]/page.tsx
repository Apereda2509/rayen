import { notFound } from 'next/navigation'
import Link from 'next/link'
import sql from '@/lib/db'
import { ModoPizarra, type Slide } from '@/components/educacion/ModoPizarra'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

type Nivel = 'kinder' | 'basica' | 'media_baja' | 'media_alta'

interface PresentacionRow {
  id: string
  slug: string
  titulo: string
  nivel: Nivel
  slides: Slide[]
  species_common_name: string | null
  species_slug: string | null
}

async function getPresentacion(slug: string): Promise<PresentacionRow | null> {
  const [row] = await sql<PresentacionRow[]>`
    SELECT
      p.id, p.slug, p.titulo, p.nivel, p.slides, p.species_id,
      s.common_name AS species_common_name,
      s.slug        AS species_slug
    FROM presentaciones p
    LEFT JOIN species s ON s.id = p.species_id
    WHERE p.slug = ${slug} AND p.published = TRUE
  `
  return row ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const p = await getPresentacion(params.slug)
    if (!p) return { title: 'Presentación no encontrada' }
    return {
      title: `${p.titulo} — Aula | Rayen`,
      description: `Presentación sobre ${p.titulo} para el nivel ${p.nivel}.`,
    }
  } catch {
    return { title: 'Presentación' }
  }
}

const NIVEL_LABELS: Record<Nivel, string> = {
  kinder:     'Kínder a 2° básico',
  basica:     '3° a 6° básico',
  media_baja: '7° a 2° medio',
  media_alta: '3° y 4° medio',
}

export default async function PresentacionPage({ params }: Props) {
  let presentacion: PresentacionRow | null

  try {
    presentacion = await getPresentacion(params.slug)
  } catch {
    notFound()
  }

  if (!presentacion) notFound()

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-600 mb-8 flex items-center gap-1.5">
          <Link href="/educacion" className="hover:text-zinc-400 transition-colors">Educación</Link>
          <span>/</span>
          <Link href="/educacion/aula" className="hover:text-zinc-400 transition-colors">Aula</Link>
          <span>/</span>
          <span className="text-zinc-400 truncate max-w-[200px]">{presentacion.titulo}</span>
        </nav>

        {/* Metadatos */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
            {NIVEL_LABELS[presentacion.nivel]}
          </span>
          {presentacion.species_common_name && (
            <Link
              href={`/especies/${presentacion.species_slug}`}
              className="text-xs text-[#00E676] hover:underline"
            >
              {presentacion.species_common_name}
            </Link>
          )}
        </div>

        <ModoPizarra
          titulo={presentacion.titulo}
          nivel={presentacion.nivel}
          slides={presentacion.slides}
        />
      </div>
    </div>
  )
}
