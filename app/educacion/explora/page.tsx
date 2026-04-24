import Link from 'next/link'
import sql from '@/lib/db'
import type { Metadata } from 'next'
import ExploraFeed from '@/components/educacion/ExploraFeed'

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
      <div className="px-6 md:px-12 lg:px-24 py-12">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <nav className="text-xs text-zinc-600 mb-8 flex items-center gap-1.5">
            <Link href="/educacion" className="hover:text-zinc-400 transition-colors">
              Educación
            </Link>
            <span>/</span>
            <span className="text-zinc-400">Explora</span>
          </nav>

          <h1
            className="font-bold text-4xl text-white mb-2"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Explora
          </h1>
          <p className="text-zinc-400 mb-12" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
            Artículos sobre biodiversidad, conservación y ecosistemas chilenos.
          </p>

          {articulos.length === 0 ? (
            <p className="text-zinc-500 text-center py-20">No hay artículos publicados aún.</p>
          ) : (
            <ExploraFeed articulos={articulos} />
          )}

        </div>
      </div>
    </div>
  )
}
