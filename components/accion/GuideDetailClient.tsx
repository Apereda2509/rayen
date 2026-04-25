'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Guide } from '@/lib/guides-data'

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function BarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="14" width="4" height="8" rx="1" />
      <rect x="10" y="8" width="4" height="14" rx="1" />
      <rect x="18" y="2" width="4" height="20" rx="1" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

interface Props {
  guide: Guide
  guideNumber: number
}

export function GuideDetailClient({ guide, guideNumber }: Props) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 30])

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: guide.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* HERO */}
      <div
        ref={heroRef}
        className="relative bg-[#0A0A0A] min-h-[60vh] px-6 md:px-16 pt-32 pb-16 overflow-hidden"
      >
        {/* Número decorativo fondo */}
        <span
          className="absolute -left-4 top-16 font-grotesk font-black leading-none select-none pointer-events-none text-[#00E676]"
          style={{
            fontSize: 'clamp(120px, 20vw, 220px)',
            opacity: 0.06,
            lineHeight: 1,
          }}
          aria-hidden
        >
          {String(guideNumber).padStart(2, '0')}
        </span>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Columna izquierda — texto */}
          <motion.div style={{ y: titleY }} className="flex flex-col">
            <Link
              href="/accion?tab=guias"
              className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm transition-colors mb-6 w-fit"
            >
              <ArrowLeftIcon />
              Volver a Guías
            </Link>

            <span className="inline-flex items-center bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase font-medium w-fit mb-4">
              {guide.category}
            </span>

            <h1
              className="font-grotesk font-bold text-white leading-[1.05]"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              {guide.title}
            </h1>

            <div className="flex flex-wrap gap-3 mt-6">
              <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-300">
                <ClockIcon />
                {guide.estimatedTime}
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-300">
                <BarIcon />
                {guide.difficulty}
              </span>
            </div>
          </motion.div>

          {/* Columna derecha — imagen con parallax */}
          <motion.div style={{ y: imageY }} className="relative">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden">
              <Image
                src={guide.imageUrl}
                alt={guide.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-4xl mx-auto py-20 px-6">
        {/* Descripción */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl text-zinc-300 leading-relaxed"
        >
          {guide.description}
        </motion.p>

        {/* Pasos */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="border border-zinc-800 rounded-3xl p-8 mt-12"
        >
          <h2 className="font-grotesk font-bold text-white text-2xl mb-6">
            Pasos a seguir
          </h2>
          <ol className="divide-y divide-zinc-800">
            {guide.steps.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.1,
                }}
                className="flex gap-6 items-start py-6 first:pt-0 last:pb-0"
              >
                <span className="font-grotesk font-bold text-2xl text-[#00E676] flex-shrink-0 leading-tight">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <p className="text-zinc-300 text-base leading-relaxed mt-1">{step}</p>
              </motion.li>
            ))}
          </ol>
        </motion.div>

        {/* Contacto si existe */}
        {guide.contact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="mt-6 flex items-center gap-2 text-sm text-zinc-500"
          >
            <span>Recurso oficial:</span>
            <a
              href={guide.contact.href}
              target={guide.contact.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="text-[#00E676] hover:underline"
            >
              {guide.contact.label}
            </a>
          </motion.div>
        )}

        {/* Card de acción final */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-900 border border-[#00E676]/20 rounded-3xl p-8 mt-16"
        >
          <h3 className="font-grotesk font-bold text-3xl text-white">
            ¿Listo para actuar?
          </h3>
          <p className="text-zinc-400 mt-3 leading-relaxed">
            Cada acción pequeña suma. Comparte esta guía o vuelve a /accion para firmar una petición.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 border border-zinc-700 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:border-zinc-500 transition-colors"
            >
              <ShareIcon />
              Compartir guía
            </button>
            <Link
              href="/accion?tab=peticiones"
              className="inline-flex items-center gap-2 bg-[#00E676] text-black rounded-full px-5 py-2.5 text-sm font-bold hover:bg-[#00E676]/90 transition-colors"
            >
              Ver peticiones →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
