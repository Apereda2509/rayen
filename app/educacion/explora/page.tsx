import Link from 'next/link'
import sql from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explora — Educación | Rayen',
  description: 'Artículos sobre biodiversidad, conservación y ecosistemas chilenos.',
}

async function getArticulos() {
  try {
    return await sql<{
      id: string; slug: string; titulo: string; subtitulo: string | null
      imagen_url: string | null; tiempo_lectura: number; created_at: string
    }[]>`
      SELECT id, slug, titulo, subtitulo, imagen_url, tiempo_lectura, created_at
      FROM articulos WHERE published = TRUE ORDER BY created_at DESC
    `
  } catch {
    return []
  }
}

export default async function ExploraPage() {
  const articulos = await getArticulos()

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-600 mb-8 flex items-center gap-1.5">
          <Link href="/educacion" className="hover:text-zinc-400 transition-colors">Educación</Link>
          <span>/</span>
          <span className="text-zinc-400">Explora</span>
        </nav>

        <h1 className="font-grotesk font-bold text-4xl text-white mb-2">Explora</h1>
        <p className="text-zinc-400 mb-10">Artículos sobre biodiversidad, conservación y ecosistemas chilenos.</p>

        {articulos.length === 0 ? (
          <p className="text-zinc-500 text-center py-20">No hay artículos publicados aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articulos.map((a) => (
              <Link
                key={a.id}
                href={`/educacion/explora/${a.slug}`}
                className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-600 transition-colors"
              >
                {/* Imagen o placeholder */}
                <div className="h-44 bg-zinc-800 relative overflow-hidden">
                  {a.imagen_url ? (
                    <img
                      src={a.imagen_url}
                      alt={a.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-zinc-700 text-xs font-medium tracking-wide uppercase">Artículo</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <h2 className="font-grotesk font-semibold text-white text-lg leading-snug mb-2 group-hover:text-[#00E676] transition-colors">
                    {a.titulo}
                  </h2>
                  {a.subtitulo && (
                    <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 flex-1 mb-3">
                      {a.subtitulo}
                    </p>
                  )}
                  <p className="text-zinc-600 text-xs mt-auto">
                    {a.tiempo_lectura} min de lectura
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
