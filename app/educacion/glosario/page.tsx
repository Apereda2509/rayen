import sql from '@/lib/db'
import { GlosarioBuscador } from '@/components/educacion/GlosarioBuscador'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Glosario — Educación | Rayen',
  description: 'Términos clave sobre biodiversidad, conservación y ecosistemas de Chile.',
}

async function getGlosario() {
  try {
    return await sql<{ id: string; termino: string; definicion: string; nivel: string }[]>`
      SELECT id, termino, definicion, nivel FROM glosario ORDER BY termino ASC
    `
  } catch {
    return []
  }
}

export default async function GlosarioPage() {
  const terminos = await getGlosario()

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">

        <nav className="text-xs text-zinc-600 mb-8 flex items-center gap-1.5">
          <Link href="/educacion" className="hover:text-zinc-400 transition-colors">Educación</Link>
          <span>/</span>
          <span className="text-zinc-400">Glosario</span>
        </nav>

        <h1 className="font-grotesk font-bold text-4xl text-white mb-2">Glosario</h1>
        <p className="text-zinc-400 mb-10">Términos clave sobre biodiversidad y conservación.</p>

        <GlosarioBuscador terminos={terminos} />
      </div>
    </div>
  )
}
