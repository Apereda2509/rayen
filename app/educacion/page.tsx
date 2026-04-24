import Link from 'next/link'
import sql from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Educación — Rayen',
  description: 'Artículos sobre biodiversidad, presentaciones para el aula y glosario de términos clave sobre la naturaleza de Chile.',
}

async function getGlosarioPreview() {
  try {
    return await sql<{ id: string; termino: string; definicion: string }[]>`
      SELECT id, termino, definicion FROM glosario ORDER BY termino ASC LIMIT 6
    `
  } catch {
    return []
  }
}

export default async function EducacionPage() {
  const terminos = await getGlosarioPreview()

  return (
    <div className="bg-[#0A0A0A] min-h-screen">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center">
        <h1 className="font-grotesk font-bold text-5xl md:text-6xl text-white leading-tight max-w-3xl">
          Aprende sobre la naturaleza de Chile
        </h1>
        <p className="mt-4 text-xl text-zinc-300 max-w-xl">
          Artículos, presentaciones para el aula y un glosario de términos clave.
        </p>
      </section>

      {/* Dos rutas */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card Explora */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col">
            <h2 className="font-grotesk font-bold text-3xl text-white mb-3">Explora</h2>
            <p className="text-zinc-400 flex-1 mb-6">
              Artículos sobre biodiversidad, conservación y ecosistemas chilenos. Para cualquier persona curiosa.
            </p>
            <Link
              href="/educacion/explora"
              className="inline-flex items-center gap-2 self-start rounded-lg bg-[#00E676] hover:bg-[#00c85e] px-5 py-2.5 text-sm font-semibold text-black transition-colors"
            >
              Ver artículos →
            </Link>
          </div>

          {/* Card Aula — próximamente */}
          <div className="relative bg-zinc-900 border border-[#00E676] rounded-2xl p-8 flex flex-col overflow-hidden cursor-not-allowed">
            <span className="absolute top-4 right-4 rounded-full bg-[#00E676] px-3 py-1 text-xs font-semibold text-black">
              Próximamente
            </span>
            <span className="inline-block mb-4 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 px-3 py-1 text-xs font-semibold text-[#00E676] self-start">
              Para profesores
            </span>
            <h2 className="font-grotesk font-bold text-3xl text-white mb-3">Aula</h2>
            <p className="text-zinc-400 flex-1 mb-6">
              Presentaciones adaptadas por nivel educativo para usar en clases. Modo pizarra incluido.
            </p>
            <span className="inline-flex items-center gap-2 self-start rounded-lg bg-[#00E676] px-5 py-2.5 text-sm font-semibold text-black opacity-50 pointer-events-none select-none">
              Entrar al Aula →
            </span>
          </div>
        </div>
      </section>

      {/* Glosario preview */}
      {terminos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
          <div className="border-t border-zinc-800 pt-12">
            <h2 className="font-grotesk font-bold text-2xl text-white mb-8">Glosario</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {terminos.map((t) => (
                <div key={t.id}>
                  <p className="font-grotesk font-semibold text-white mb-1">{t.termino}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{t.definicion}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/educacion/glosario"
                className="text-[#00E676] hover:text-[#00c85e] text-sm font-medium transition-colors"
              >
                Ver glosario completo →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
