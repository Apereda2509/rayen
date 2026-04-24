'use client'

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import type { SpeciesSummary } from '@/lib/types'
import { ConservationBadge } from '@/components/species/ConservationBadge'

function proxied(url: string | null | undefined): string | null | undefined {
  if (!url) return url
  if (url.includes('wikimedia.org')) return `/api/img?url=${encodeURIComponent(url)}`
  return url
}

function SpeciesImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [error, setError] = useState(false)
  const url = proxied(src)

  if (!url || error) {
    return (
      <div className="w-full h-full bg-zinc-800 flex items-center justify-center px-4">
        <span className="text-zinc-400 text-sm text-center leading-snug">{alt}</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => setError(true)}
    />
  )
}

// ── TiltCard — inclinación 3D con brillo que sigue al mouse ──

function TiltCard({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })
  const [hovered, setHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setRotateX((0.5 - y) * 16)
    setRotateY((x - 0.5) * 16)
    setGlowPos({ x: x * 100, y: y * 100 })
  }

  function handleMouseLeave() {
    setHovered(false)
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ transformStyle: 'preserve-3d', position: 'relative' }}
      >
        {children}
        {hovered && !reduced && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 12,
              background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.07), transparent 60%)`,
              pointerEvents: 'none',
              zIndex: 20,
            }}
          />
        )}
      </motion.div>
    </div>
  )
}

// ── WordReveal — clip-path por palabras ───────────────────────

function WordReveal({ text, reduced }: { text: string; reduced: boolean }) {
  const words = text.split(' ')

  if (reduced) {
    return <>{text}</>
  }

  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
          style={{ display: 'inline-block' }}
        >
          {word}{i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </>
  )
}

const MapPreview = dynamic(() => import('./MapPreview'), { ssr: false })

interface Props {
  species: SpeciesSummary[]
}

// ── Sección A — Especies destacadas ──────────────────────────

function SectionEspecies({ species, reduced }: { species: SpeciesSummary[]; reduced: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-20, 20])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#0A0A0A]">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-[#0A0A0A]"
        style={{ y: bgY }}
        aria-hidden
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-24">
        {/* Encabezado */}
        <motion.div
          className="mb-14 max-w-2xl"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="font-grotesk text-4xl md:text-5xl font-bold text-white leading-tight">
            Conoce la fauna y flora de Chile
          </h2>
          <p className="mt-4 text-zinc-400 text-lg leading-relaxed">
            Fichas verificadas con fuentes del SAG, Ministerio del Medio Ambiente e IUCN.
          </p>
        </motion.div>

        {/* Grid de cards con TiltCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {species.map((sp, i) => (
            <motion.div
              key={sp.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.5, ease: 'easeOut', delay: i * 0.1 }
              }
            >
              <TiltCard reduced={reduced}>
                <Link
                  href={`/especies/${sp.slug}`}
                  className="group block rounded-xl overflow-hidden bg-zinc-900 transition-colors duration-300"
                >
                  {/* Imagen */}
                  <div className="relative aspect-[4/3]">
                    <SpeciesImage src={sp.primaryPhoto} alt={sp.commonName} />

                    {sp.uicnStatus && (
                      <div className="absolute top-3 left-3">
                        <ConservationBadge status={sp.uicnStatus} photoOverlay />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-[#00E676] font-medium text-sm tracking-wide">
                        Ver ficha →
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-4 py-3">
                    <p className="font-grotesk font-semibold text-white leading-snug">
                      {sp.commonName}
                    </p>
                    <p className="font-serif italic text-sm text-zinc-400 mt-0.5">
                      {sp.scientificName}
                    </p>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/especies"
            className="inline-flex items-center gap-2 border border-[#00E676] text-[#00E676] px-8 py-3 rounded-lg font-medium transition-colors duration-200 hover:bg-[#00E676] hover:text-black"
          >
            Ver todas las especies →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Sección B — Preview del mapa ─────────────────────────────

function SectionMapa({ reduced }: { reduced: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const textY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [30, -30])
  const mapY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-20, 20])

  return (
    <section ref={sectionRef} className="bg-[#0A0A0A] border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Columna texto */}
          <motion.div
            style={{ y: textY }}
            initial={reduced ? false : { opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, ease: 'easeOut' }}
          >
            <h2 className="font-grotesk text-4xl md:text-5xl font-bold text-white leading-tight">
              Explora Chile especie por especie
            </h2>
            <p className="mt-6 text-zinc-300 text-lg leading-relaxed">
              El mapa interactivo de Rayen muestra la distribución de cada especie documentada
              a lo largo del territorio. Desde la Puna hasta la Patagonia.
            </p>
            <div className="mt-8">
              <Link
                href="/mapa"
                className="inline-flex items-center gap-2 bg-[#00E676] hover:bg-[#52F599] text-black font-medium px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Abrir el mapa →
              </Link>
            </div>
          </motion.div>

          {/* Columna mapa */}
          <motion.div
            style={{ y: mapY }}
            initial={reduced ? false : { opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          >
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">
              Mapa interactivo
            </p>
            <div className="rounded-2xl overflow-hidden shadow-2xl h-80 md:h-96 border border-zinc-800">
              <MapPreview />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

// ── Sección C — Misión (fondo oscuro + word reveal) ──────────

function SectionMision({ reduced }: { reduced: boolean }) {
  return (
    <section className="relative overflow-hidden bg-zinc-950">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h2 className="font-grotesk text-3xl md:text-4xl font-bold text-white leading-snug">
          <WordReveal
            text="Una plataforma. Toda la biodiversidad de Chile."
            reduced={reduced}
          />
        </h2>
        <motion.p
          className="mt-6 text-lg text-zinc-300 leading-relaxed"
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        >
          Rayen reúne fichas de especies, mapas, leyes de protección y formas concretas
          de actuar. Un proyecto independiente, construido con fuentes públicas verificadas
          — SAG, Ministerio del Medio Ambiente e IUCN.
        </motion.p>
        <motion.p
          className="mt-4 text-base text-zinc-500"
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        >
          Hecho por una persona, abierto a colaboradores que quieran sumar.
        </motion.p>
      </div>
    </section>
  )
}

// ── Sección D — Colaborar ─────────────────────────────────────

function SectionColaborar({ reduced }: { reduced: boolean }) {
  return (
    <section className="bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { duration: 0.65, ease: 'easeOut' }}
        >
          <h2 className="font-grotesk text-4xl md:text-5xl font-bold text-white leading-tight">
            ¿Quieres sumar a Rayen?
          </h2>
          <p className="mt-6 text-zinc-300 text-xl leading-relaxed">
            Si eres biólogo, fotógrafo, diseñador, educador o simplemente te apasiona
            la naturaleza chilena, hay un lugar para ti acá. Rayen crece con cada
            persona que se suma.
          </p>
          <div className="mt-8">
            <a
              href="mailto:angelperedajimenez@gmail.com"
              className="font-mono text-sm md:text-base text-[#00E676] hover:underline underline-offset-4 break-all"
            >
              angelperedajimenez@gmail.com
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Export principal ──────────────────────────────────────────

export function HomeParallaxSections({ species }: Props) {
  const reduced = !!useReducedMotion()

  return (
    <>
      <SectionEspecies species={species} reduced={reduced} />
      <SectionMapa reduced={reduced} />
      <SectionMision reduced={reduced} />
      <SectionColaborar reduced={reduced} />
      {/* Gradiente de transición hacia el footer */}
      <div
        aria-hidden
        style={{
          height: 120,
          background: 'linear-gradient(to bottom, transparent, #0A0A0A)',
          marginTop: -1,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
