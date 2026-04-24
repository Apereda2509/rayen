import { auth } from '@/auth'
import Link from 'next/link'
import { LogIn, Eye } from 'lucide-react'
import { NuevoAvistamientoForm } from '@/components/avistamientos/NuevoAvistamientoForm'

// No cachear — necesita sesión fresca
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { especie?: string }
}

export async function generateMetadata() {
  return { title: 'Reportar avistamiento — Rayen' }
}

export default async function NuevoAvistamientoPage({ searchParams }: Props) {
  const session = await auth()

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Encabezado */}
      <div className="mb-8">
        <nav className="mb-4 text-sm text-stone-400">
          <Link href="/" className="hover:text-neon-600 transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-600">Reportar avistamiento</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-600">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Reportar avistamiento</h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Comparte dónde y cuándo viste una especie nativa de Chile
            </p>
          </div>
        </div>
      </div>

      {/* Contenido condicional según sesión */}
      {session?.user ? (
        <NuevoAvistamientoForm defaultSpeciesSlug={searchParams.especie} />
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-8 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-600">
            <Eye className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">
            Inicia sesión para reportar
          </h2>
          <p className="text-stone-500 text-sm max-w-sm mx-auto mb-6">
            Para enviar un avistamiento necesitas una cuenta. Es gratis y solo toma unos segundos con tu cuenta de Google.
          </p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent('/avistamientos/nuevo' + (searchParams.especie ? `?especie=${searchParams.especie}` : ''))}`}
            className="inline-flex items-center gap-2 rounded-xl bg-neon-400 hover:bg-neon-300 px-6 py-3 text-sm font-semibold text-black transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Iniciar sesión con Google
          </Link>
          <p className="mt-4 text-xs text-stone-400">
            O explora las{' '}
            <Link href="/especies" className="underline hover:text-neon-600">
              especies
            </Link>{' '}
            sin necesidad de cuenta
          </p>
        </div>
      )}
    </main>
  )
}
