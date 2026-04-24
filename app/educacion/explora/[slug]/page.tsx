import { notFound } from 'next/navigation'
import Link from 'next/link'
import sql from '@/lib/db'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

async function getArticulo(slug: string) {
  const [row] = await sql<{
    id: string; slug: string; titulo: string; subtitulo: string | null
    contenido: string; imagen_url: string | null; tiempo_lectura: number; created_at: string
  }[]>`
    SELECT id, slug, titulo, subtitulo, contenido, imagen_url, tiempo_lectura, created_at
    FROM articulos WHERE slug = ${slug} AND published = TRUE
  `
  return row ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const a = await getArticulo(params.slug)
    if (!a) return { title: 'Artículo no encontrado' }
    return {
      title: `${a.titulo} — Educación | Rayen`,
      description: a.subtitulo ?? undefined,
    }
  } catch {
    return { title: 'Artículo' }
  }
}

export default async function ArticuloPage({ params }: Props) {
  let articulo: Awaited<ReturnType<typeof getArticulo>>
  try {
    articulo = await getArticulo(params.slug)
  } catch {
    notFound()
  }
  if (!articulo) notFound()

  const parrafos = articulo.contenido.split('\n\n').filter(Boolean)

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-600 mb-10 flex items-center gap-1.5">
          <Link href="/educacion" className="hover:text-zinc-400 transition-colors">Educación</Link>
          <span>/</span>
          <Link href="/educacion/explora" className="hover:text-zinc-400 transition-colors">Explora</Link>
          <span>/</span>
          <span className="text-zinc-400 truncate max-w-[200px]">{articulo.titulo}</span>
        </nav>

        {/* Header */}
        <header className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="font-grotesk font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
            {articulo.titulo}
          </h1>
          {articulo.subtitulo && (
            <p className="text-xl text-zinc-300 leading-relaxed mb-4">{articulo.subtitulo}</p>
          )}
          <p className="text-zinc-500 text-sm">{articulo.tiempo_lectura} min de lectura</p>
        </header>

        {/* Imagen */}
        {articulo.imagen_url && (
          <div className="max-w-3xl mx-auto mb-12 rounded-2xl overflow-hidden">
            <img
              src={articulo.imagen_url}
              alt={articulo.titulo}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Contenido */}
        <article className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {parrafos.map((p, i) => (
              <p key={i} className="text-lg text-zinc-300 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Footer del artículo */}
          <div className="mt-16 pt-8 border-t border-zinc-800">
            <Link
              href="/educacion/explora"
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              ← Volver a Explora
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
