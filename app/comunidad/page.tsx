import { ComunidadTabs } from '@/components/comunidad/ComunidadTabs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comunidad — Rayen',
  description: 'Avistamientos ciudadanos, fotos de áreas protegidas y observadores de especies nativas de Chile.',
}

export default function ComunidadPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-zinc-950 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Comunidad</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Avistamientos, fotos y observadores de especies nativas de Chile
        </p>
      </div>
      <ComunidadTabs />
    </main>
  )
}
