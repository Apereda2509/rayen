import { ComunidadTabs } from '@/components/comunidad/ComunidadTabs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comunidad — Rayen',
  description: 'Avistamientos ciudadanos, fotos de áreas protegidas y observadores de especies nativas de Chile.',
}

export default function ComunidadPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Comunidad</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Avistamientos, fotos y observadores de especies nativas de Chile
          </p>
        </div>
        <ComunidadTabs />
      </div>
    </div>
  )
}
