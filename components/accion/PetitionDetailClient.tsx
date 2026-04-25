'use client'

import { useRef, useState } from 'react'
import { useScroll, useTransform, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { SignPetitionModal } from './SignPetitionModal'

interface Organization {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  website: string | null
}

interface Petition {
  id: string
  slug: string
  title: string
  description: string
  goal: number
  signedCount: number
  imageUrl: string | null
  active: boolean
  endsAt: string | null
  organization: Organization | null
  species: {
    slug: string
    commonName: string
    uicnStatus: string | null
    primaryPhoto: string | null
  } | null
  hasSigned: boolean
}

interface Props {
  petition: Petition
  userEmail: string | null
  userId: string | null
  isLoggedIn: boolean
}

export function PetitionDetailClient({ petition, userEmail, userId, isLoggedIn }: Props) {
  const [signedCount, setSignedCount] = useState(petition.signedCount)
  const [hasSigned, setHasSigned] = useState(petition.hasSigned)
  const [showModal, setShowModal] = useState(false)
  const [imgError, setImgError] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()

  const imageY = useTransform(
    scrollY,
    [0, 600],
    reduced ? [0, 0] : [0, 180],
  )

  const progress = petition.goal > 0
    ? Math.min((signedCount / petition.goal) * 100, 100)
    : 0

  const orgInitials = petition.organization?.name
    ? petition.organization.name
        .split(' ')
        .filter(w => w.length > 2)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('')
    : '?'

  function handleSignSuccess(newCount: number) {
    setSignedCount(newCount)
    setHasSigned(true)
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* ── HERO con parallax ─────────────────────────────────── */}
      <div ref={heroRef} className="relative min-h-[50vh] flex items-end overflow-hidden">
        {/* Imagen de fondo con parallax */}
        <motion.div className="absolute inset-0 scale-110" style={{ y: imageY }}>
          {petition.imageUrl && !imgError ? (
            <img
              src={petition.imageUrl}
              alt={petition.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <span
                className="text-zinc-600 text-5xl font-bold"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Rayen
              </span>
            </div>
          )}
        </motion.div>

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Contenido del hero */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-12 pb-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-5">
            <Link href="/accion" className="hover:text-[#00E676] transition-colors">
              Acción
            </Link>
            <span>/</span>
            <span className="text-zinc-300">Petición</span>
          </div>

          {/* Badges */}
          <div className="flex items-center flex-wrap gap-3 mb-4">
            <span className="text-xs font-bold text-black bg-[#00E676] px-3 py-1 rounded-full">
              Activa
            </span>
            {petition.organization && (
              <span className="text-zinc-300 text-sm">{petition.organization.name}</span>
            )}
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-3xl"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            {petition.title}
          </h1>
        </div>
      </div>

      {/* ── CONTENIDO dos columnas ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Columna izquierda — 60% */}
          <div className="lg:col-span-3 space-y-10">
            {/* Descripción completa */}
            <section>
              <h2
                className="text-xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Sobre esta petición
              </h2>
              <p
                className="text-zinc-300 text-base leading-relaxed"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {petition.description}
              </p>
            </section>

            {/* ¿Por qué importa? */}
            <section>
              <h2
                className="text-xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                ¿Por qué importa?
              </h2>
              <p
                className="text-zinc-300 text-base leading-relaxed"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                Cada firma cuenta. Tu participación envía un mensaje directo a quienes
                toman decisiones sobre la biodiversidad de Chile. Juntos podemos lograr
                cambios concretos para proteger nuestros ecosistemas únicos y las especies
                que los habitan.
              </p>
            </section>

            {/* Organización destinataria */}
            {petition.organization && (
              <section>
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  Organización destinataria
                </h2>
                <div className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  {/* Logo o iniciales */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-700 flex-shrink-0 flex items-center justify-center">
                    {petition.organization.logoUrl ? (
                      <img
                        src={petition.organization.logoUrl}
                        alt={petition.organization.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span
                        className="text-white font-bold text-sm"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                      >
                        {orgInitials}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-white truncate"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                      {petition.organization.name}
                    </p>
                    {petition.organization.website && (
                      <a
                        href={petition.organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#00E676] hover:underline"
                      >
                        Visitar sitio web →
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Columna derecha — 40%, sticky */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              {/* Contador de firmas */}
              <p
                className="text-5xl font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                {signedCount.toLocaleString('es-CL')}
              </p>
              <p
                className="text-zinc-400 text-sm mb-5"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                firmas de {petition.goal.toLocaleString('es-CL')} necesarias
              </p>

              {/* Barra de progreso */}
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden mb-6">
                <div
                  className="h-full bg-[#00E676] rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Botón de firma o estado ya firmado */}
              {hasSigned ? (
                <div className="w-full py-3 rounded-xl bg-zinc-800 text-[#00E676] font-semibold text-center text-sm mb-5">
                  ✓ Ya firmaste esta petición
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3 rounded-xl bg-[#00E676] hover:bg-[#52F599] text-black font-semibold transition-colors mb-5 text-sm"
                >
                  Firmar esta petición
                </button>
              )}

              {/* Botones de compartir */}
              <div>
                <p className="text-zinc-500 text-xs mb-3">Compartir en</p>
                <div className="flex gap-2">
                  {/* Instagram */}
                  <button
                    onClick={() => console.log('compartir en Instagram')} // TODO: implementar plantilla de compartir
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2 px-3 text-sm transition-colors"
                    title="Compartir en Instagram"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    <span className="hidden sm:inline text-xs">Instagram</span>
                  </button>

                  {/* X */}
                  <button
                    onClick={() => console.log('compartir en X')} // TODO: implementar plantilla de compartir
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2 px-3 text-sm transition-colors"
                    title="Compartir en X"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.732-8.836L2.25 2.25h6.921l4.255 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                    </svg>
                    <span className="hidden sm:inline text-xs">X</span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={() => console.log('compartir en LinkedIn')} // TODO: implementar plantilla de compartir
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2 px-3 text-sm transition-colors"
                    title="Compartir en LinkedIn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span className="hidden sm:inline text-xs">LinkedIn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de firma */}
      {showModal && (
        <SignPetitionModal
          petitionId={petition.id}
          petitionTitle={petition.title}
          userEmail={userEmail}
          isLoggedIn={isLoggedIn}
          onClose={() => setShowModal(false)}
          onSuccess={handleSignSuccess}
        />
      )}
    </div>
  )
}
