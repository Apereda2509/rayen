'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

// Video de fondo: usa la variable de entorno NEXT_PUBLIC_HERO_VIDEO_URL
// Si no existe, fallback a demo Cloudinary (naturaleza)
const VIDEO_SRC =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
  'https://res.cloudinary.com/demo/video/upload/v1/samples/sea-turtle.mp4'

// Imagen poster (fallback si el video no carga o prefers-reduced-motion)
const POSTER_SRC =
  'https://inaturalist-open-data.s3.amazonaws.com/photos/343001023/large.jpg'

// ── Contador animado ──────────────────────────────────────────
function AnimatedCount({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const duration = 1400
    const start = performance.now()
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])

  return (
    <span style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
      {count.toLocaleString('es-CL')}
      {suffix}
    </span>
  )
}

interface Props {
  petitionsCount: number
  orgsCount: number
}

export function AccionHero({ petitionsCount, orgsCount }: Props) {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()

  // El texto sube a 0.15x la velocidad del scroll
  const textY = useTransform(scrollY, [0, 600], reduced ? [0, 0] : [0, -90])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <div className="relative min-h-[70vh] overflow-hidden flex items-center">
      {/* ── Fondo de video ──────────────────────────────────── */}
      {!reduced ? (
        <video
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
      ) : (
        /* Cuando el usuario prefiere reduced-motion, usar solo imagen */
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${POSTER_SRC})` }}
          aria-hidden="true"
        />
      )}

      {/* ── Overlay degradado ───────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.40) 50%, #0A0A0A 100%)',
        }}
      />

      {/* ── Contenido con parallax ──────────────────────────── */}
      <motion.div
        className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6 pt-20 pb-16"
        style={{ y: textY, opacity }}
      >
        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-block text-sm font-medium tracking-widest uppercase mb-4"
          style={{ color: '#00E676', fontFamily: 'var(--font-inter), sans-serif' }}
        >
          Tu acción importa
        </motion.span>

        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="text-5xl md:text-7xl font-bold text-white leading-tight max-w-4xl"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          Protege la biodiversidad de Chile
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="text-xl text-zinc-300 max-w-2xl mt-6 leading-relaxed"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          Firma peticiones, conoce el marco legal y únete a las organizaciones que
          trabajan por la naturaleza nativa de Chile.
        </motion.p>

        {/* Stat row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
          className="flex items-center gap-0 mt-14 divide-x divide-zinc-600"
        >
          {[
            { value: petitionsCount, label: 'peticiones activas' },
            { value: orgsCount,      label: 'organizaciones aliadas' },
            { value: 106,            label: 'áreas protegidas' },
          ].map(({ value, label }, i) => (
            <div key={i} className="flex flex-col items-center px-8 first:pl-0 last:pr-0">
              <span className="text-3xl font-bold text-white tabular-nums">
                <AnimatedCount target={value} />
              </span>
              <span
                className="text-xs text-zinc-400 mt-1 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
