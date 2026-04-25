import { auth } from '@/auth'
import Link from 'next/link'
import { LogIn, Eye } from 'lucide-react'
import { NuevoAvistamientoForm } from '@/components/avistamientos/NuevoAvistamientoForm'
import { SightingErrorBoundary } from '@/components/avistamientos/SightingErrorBoundary'

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
    <div className="bg-[#0A0A0A] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16 pt-28">

        {/* Breadcrumb */}
        <Link
          href="/"
          className="text-zinc-500 hover:text-white text-sm flex items-center gap-1.5 mb-8 transition-colors"
        >
          ← Inicio
        </Link>

        {/* Header editorial */}
        <div className="mb-10">
          <span className="text-[#00E676] text-xs font-medium tracking-widest uppercase">
            Ciencia ciudadana
          </span>
          <h1
            className="font-bold text-white leading-tight mt-3"
            style={{
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              fontSize: 'clamp(2rem, 6vw, 3rem)',
            }}
          >
            Reportar<br />avistamiento
          </h1>
          <p className="text-zinc-400 text-base mt-4 leading-relaxed">
            Tu observación contribuye al registro científico de la biodiversidad chilena. Cada avistamiento importa.
          </p>
        </div>

        {/* Contenido condicional según sesión */}
        {session?.user ? (
          <SightingErrorBoundary>
            <NuevoAvistamientoForm defaultSpeciesSlug={searchParams.especie} />
          </SightingErrorBoundary>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
              <Eye className="h-7 w-7" />
            </div>
            <h2
              className="text-lg font-semibold text-white mb-2"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Inicia sesión para reportar
            </h2>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
              Para enviar un avistamiento necesitas una cuenta. Es gratis y solo toma unos segundos con tu cuenta de Google.
            </p>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent('/avistamientos/nuevo' + (searchParams.especie ? `?especie=${searchParams.especie}` : ''))}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00E676] hover:bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión con Google
            </Link>
            <p className="mt-4 text-xs text-zinc-600">
              O explora las{' '}
              <Link href="/especies" className="underline hover:text-zinc-400 transition-colors">
                especies
              </Link>{' '}
              sin necesidad de cuenta
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
