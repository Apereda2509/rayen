'use client'

import Link from 'next/link'

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  ley:                    { label: 'Ley',                    className: 'bg-blue-900/80 text-blue-300' },
  decreto:                { label: 'Decreto',                className: 'bg-amber-900/80 text-amber-300' },
  convenio_internacional: { label: 'Convenio Internacional', className: 'bg-purple-900/80 text-purple-300' },
}

const LAW_LOGO_MAP: Record<string, string> = {
  'cites':         '/logos/laws/cites.png',
  'diversidad':    '/logos/laws/cbd.png',
  'caza':          '/logos/laws/sag.png',
  'araucaria':     '/logos/laws/minagri.png',
  'bosque':        '/logos/laws/conaf.png',
  'humedales':     '/logos/laws/mma.png',
  'clasificación': '/logos/laws/mma.png',
  'sbap':          '/logos/laws/mma.png',
  'biodiversidad': '/logos/laws/mma.png',
}

function getLawLogo(name: string): string | null {
  const lower = name.toLowerCase()
  for (const [key, val] of Object.entries(LAW_LOGO_MAP)) {
    if (lower.includes(key)) return val
  }
  return null
}

interface Law {
  id: string
  name: string
  number: string
  year: number
  type: string
  description: string | null
  url: string | null
  emisor: string | null
  imageUrl: string | null
  shortDescription: string | null
  fullDescription: string | null
  relevance: string | null
}

interface Props {
  law: Law
}

export function LawDetailClient({ law }: Props) {
  const badge = TYPE_BADGE[law.type] ?? { label: law.type, className: 'bg-zinc-800/80 text-zinc-300' }
  const logoSrc = getLawLogo(law.name)

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* HERO — logo institucional sobre fondo oscuro */}
      <div className="relative min-h-[45vh] bg-[#0A0A0A] flex flex-col items-center justify-center px-6 pt-24 pb-12">

        {/* Breadcrumb */}
        <div className="absolute top-8 left-6 md:left-10">
          <Link
            href="/accion?tab=marco-legal"
            className="text-zinc-400 text-sm hover:text-white transition-colors flex items-center gap-1.5"
          >
            ← Volver al Marco Legal
          </Link>
        </div>

        {/* Logo institucional sobre fondo blanco */}
        <div
          className="bg-white rounded-2xl px-10 py-6 mb-8 flex items-center justify-center"
          style={{ minWidth: '220px', minHeight: '110px' }}
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={law.emisor ?? law.name}
              className="max-h-20 max-w-xs object-contain"
            />
          ) : (
            <span
              className="font-bold text-zinc-800 text-3xl"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              {law.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Badge tipo + año */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
          <span className="text-zinc-400 text-sm">{law.year}</span>
        </div>

        {/* Título */}
        <h1
          className="text-4xl md:text-5xl font-bold text-white leading-tight text-center max-w-3xl"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          {law.name}
        </h1>

        {law.emisor && (
          <p className="text-zinc-400 mt-3 text-sm text-center">{law.emisor}</p>
        )}
      </div>

      {/* CONTENIDO */}
      <div className="bg-[#0A0A0A] py-16 px-6">
        <div className="max-w-3xl mx-auto">

          {/* ¿De qué trata? */}
          {(law.fullDescription ?? law.description) && (
            <section className="mb-12">
              <h2
                className="text-2xl font-semibold text-white mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                ¿De qué trata?
              </h2>
              <p
                className="text-zinc-300 leading-relaxed"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {law.fullDescription ?? law.description}
              </p>
            </section>
          )}

          {/* ¿Por qué es relevante? */}
          {law.relevance && (
            <section className="mb-12">
              <h2
                className="text-2xl font-semibold text-white mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                ¿Por qué es relevante para la biodiversidad?
              </h2>
              <p
                className="text-zinc-300 leading-relaxed"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {law.relevance}
              </p>
            </section>
          )}

          {/* Card acción */}
          {law.url && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-10">
              <h3
                className="font-semibold text-white text-lg"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Ver el documento oficial
              </h3>
              <p
                className="text-zinc-400 text-sm mt-1"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                Accede al texto completo en el sitio oficial del emisor.
              </p>
              <button
                onClick={() => window.open(law.url!, '_blank', 'noopener,noreferrer')}
                className="mt-4 inline-block bg-[#00E676] text-black font-semibold rounded-xl px-6 py-3 hover:bg-[#52F599] transition-colors"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Abrir documento oficial ↗
              </button>
              <p className="text-zinc-600 text-xs mt-3" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                Rayen no almacena ni reproduce el documento — te redirige al sitio oficial del emisor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
