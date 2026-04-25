'use client'

import { useRef } from 'react'
import { useScroll, useTransform, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  ley:                    { label: 'Ley',                    className: 'bg-blue-900/80 text-blue-300' },
  decreto:                { label: 'Decreto',                className: 'bg-amber-900/80 text-amber-300' },
  convenio_internacional: { label: 'Convenio Internacional', className: 'bg-purple-900/80 text-purple-300' },
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
  const heroRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()

  const imageY = useTransform(scrollY, [0, 600], reduced ? [0, 0] : [0, 150])

  const badge = TYPE_BADGE[law.type] ?? { label: law.type, className: 'bg-zinc-800/80 text-zinc-300' }

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* HERO con parallax */}
      <div ref={heroRef} className="relative min-h-[45vh] flex items-end overflow-hidden">
        {/* Imagen de fondo con parallax */}
        {law.imageUrl && (
          <motion.div
            className="absolute inset-0"
            style={{ y: imageY }}
          >
            <img
              src={law.imageUrl}
              alt={law.name}
              className="w-full h-full object-cover scale-110"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
        {!law.imageUrl && (
          <div className="absolute inset-0 bg-zinc-900" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Contenido hero */}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-14 pt-28">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/accion?tab=marco-legal"
              className="text-zinc-400 text-sm hover:text-white transition-colors flex items-center gap-1.5"
            >
              ← Volver al Marco Legal
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm ${badge.className}`}>
              {badge.label}
            </span>
            <span className="text-zinc-400 text-sm">{law.year}</span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            {law.name}
          </h1>

          {law.emisor && (
            <p className="text-zinc-300 mt-3 text-sm">{law.emisor}</p>
          )}
        </div>
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
