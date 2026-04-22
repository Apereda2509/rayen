import { ComunidadFeed } from '@/components/comunidad/ComunidadFeed'

export const metadata = { title: 'Comunidad — Rayen' }

export default function ComunidadPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Comunidad</h1>
        <p className="text-stone-500 text-sm mt-1">Fotos de avistamientos verificados de especies nativas de Chile</p>
      </div>
      <ComunidadFeed />
    </main>
  )
}
