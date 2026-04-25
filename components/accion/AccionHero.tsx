'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

interface Props {
  petitionsCount: number
  orgsCount: number
  lawsCount: number
}

export function AccionHero({ petitionsCount, orgsCount, lawsCount }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 150])
  const textY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 60])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <div ref={ref} className="relative overflow-hidden mb-10">
      {/* Fondo degradado con parallax */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#0A0A0A] to-zinc-900" />
        {/* Orbe decorativo verde */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#00E676]/5 blur-3xl" />
        <div className="absolute top-10 -left-10 w-64 h-64 rounded-full bg-[#00E676]/3 blur-2xl" />
      </motion.div>

      {/* Contenido hero con parallax suave */}
      <motion.div className="relative z-10 py-12" style={{ y: textY, opacity }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-block text-[#00E676] text-xs font-semibold tracking-widest uppercase mb-3">
            Actúa por la biodiversidad
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Acción
          </h1>
          <p
            className="text-zinc-400 max-w-2xl text-base md:text-lg leading-relaxed"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            La biodiversidad de Chile necesita defensores. Firma peticiones, conoce las
            organizaciones que trabajan en conservación, entiende el marco legal y aprende
            qué hacer cuando presencias una emergencia ambiental.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8"
        >
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-center">
            <p
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              {petitionsCount}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Peticiones activas</p>
          </div>
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-center">
            <p
              className="text-2xl font-bold text-[#00E676]"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              {orgsCount}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Organizaciones aliadas</p>
          </div>
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-center">
            <p
              className="text-2xl font-bold text-[#00E676]"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              {lawsCount}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Leyes de protección</p>
          </div>
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-center">
            <p
              className="text-2xl font-bold text-[#00E676]"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              6
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Guías de acción</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
