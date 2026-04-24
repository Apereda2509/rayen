'use client'

import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import { useRef } from 'react'

// ── Animaciones base ──────────────────────────────────────────

function useFadeUp(reduced: boolean | null): Variants {
  if (reduced) return {}
  return {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }
}

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

function SlideInLeft({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function RevealDivider() {
  const reduced = useReducedMotion()
  if (reduced) return <div className="border-b border-zinc-800 mb-12" />
  return (
    <motion.div
      className="border-b border-zinc-800 mb-12"
      initial={{ scaleX: 0, originX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  )
}

// ── Página ────────────────────────────────────────────────────

export default function SobrePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const titleY  = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -80])
  const subtitleY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -40])

  return (
    <main>
      {/* Hero con parallax */}
      <div ref={heroRef} className="relative overflow-hidden bg-white px-6 sm:px-10 py-20">
        <motion.h1
          style={{ y: titleY }}
          className="text-5xl sm:text-6xl font-bold text-stone-900 mb-6 max-w-2xl"
        >
          Sobre Rayen
        </motion.h1>
        <motion.p
          style={{ y: subtitleY }}
          className="text-lg text-stone-600 leading-relaxed max-w-xl"
        >
          Un proyecto personal sin fines de lucro creado por Ángel Pereda Jiménez,
          con el objetivo de acercar la biodiversidad nativa de Chile a todas las personas.
          Sin financiamiento comercial ni publicidad.
        </motion.p>
      </div>

      {/* Contenido principal */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12">

        <FadeUp><Section title="La visión">
          <p className="text-stone-600 leading-relaxed">
            Chile tiene una de las biodiversidades más únicas del planeta, pero la mayoría
            de sus habitantes no la conoce. Rayen nació para cambiar eso — para que cada
            chileno pueda conocer, valorar y proteger las especies que comparten su territorio.
          </p>
        </Section></FadeUp>

        <FadeUp delay={0.05}><Section title="El creador">
          <p className="text-stone-600 leading-relaxed mb-3">
            Ángel Pereda Jiménez — Santiago de Chile.
          </p>
          <a
            href="mailto:angelperedajimenez@gmail.com"
            className="inline-flex items-center gap-2 text-neon-600 hover:text-neon-500 transition-colors text-sm font-medium"
          >
            <Mail className="h-4 w-4" />
            angelperedajimenez@gmail.com
          </a>
        </Section></FadeUp>

        <FadeUp delay={0.1}><Section title="¿Quieres colaborar?">
          <p className="text-stone-600 leading-relaxed mb-3">
            Si eres biólogo, fotógrafo, educador o simplemente te apasiona la naturaleza
            chilena, escríbeme a{' '}
            <a
              href="mailto:angelperedajimenez@gmail.com"
              className="text-neon-600 hover:text-neon-500 transition-colors"
            >
              angelperedajimenez@gmail.com
            </a>
            . Rayen crece con cada persona que se suma.
          </p>
        </Section></FadeUp>

        <FadeUp delay={0.15}>
          <div className="mt-8">
            <Link
              href="/especies"
              className="inline-flex items-center gap-2 bg-neon-400 hover:bg-neon-300 text-black font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Explorar especies
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeUp>

      </div>

      {/* Manual de Marca */}
      <section className="bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-20">

          <FadeUp>
            <h2 className="font-grotesk text-4xl sm:text-5xl font-bold text-white mb-3">
              Manual de Marca
            </h2>
            <p className="text-zinc-400 text-sm mb-16">
              Las decisiones visuales de Rayen no son estética por estética — cada una tiene una razón.
            </p>
          </FadeUp>

          {/* El nombre */}
          <FadeUp>
            <BrandSection title="El nombre">
              <p className="text-zinc-300 leading-relaxed text-lg max-w-2xl">
                Rayen viene del mapudungun y significa flor. Cinco letras, sin acentos, pronunciable
                en español e inglés. Una palabra del pueblo originario más presente en Chile, porque
                este proyecto es sobre la naturaleza de este territorio — y esa naturaleza tiene nombres
                que preceden al español por siglos.
              </p>
            </BrandSection>
          </FadeUp>
          <RevealDivider />

          {/* El logo */}
          <BrandSection title="El logo">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <SlideInLeft>
                <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 py-14 px-8 gap-6">
                  <svg viewBox="0 0 40 40" fill="none" className="w-32 h-32" aria-hidden="true">
                    <circle cx="20" cy="20" r="3.5" fill="#00E676" />
                    <circle cx="34"   cy="20"     r="5" fill="#00E676" opacity="0.85" />
                    <circle cx="27"   cy="32.12"  r="5" fill="#00E676" opacity="0.85" />
                    <circle cx="13"   cy="32.12"  r="5" fill="#00E676" opacity="0.85" />
                    <circle cx="6"    cy="20"     r="5" fill="#00E676" opacity="0.85" />
                    <circle cx="13"   cy="7.88"   r="5" fill="#00E676" opacity="0.85" />
                    <circle cx="27"   cy="7.88"   r="5" fill="#00E676" opacity="0.85" />
                  </svg>
                  <span className="font-grotesk text-2xl font-semibold tracking-widest uppercase text-[#00E676]">
                    RAYEN
                  </span>
                </div>
              </SlideInLeft>
              <FadeUp>
                <p className="text-zinc-300 leading-relaxed text-lg">
                  El Grid Bloom son siete nodos conectados: seis en anillo hexagonal, uno al centro.
                  Representa una red de especies. La biodiversidad no es una lista — es un sistema
                  donde todo está relacionado. Si sacas un nodo, el sistema cambia.
                </p>
              </FadeUp>
            </div>
          </BrandSection>
          <RevealDivider />

          {/* Colores */}
          <BrandSection title="Colores">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {[
                { bg: '#00E676', border: '',              name: 'Verde Neón',    hex: '#00E676', use: 'Color primario. Acciones, links, elementos activos.',               textColor: 'text-black',   hexColor: 'text-black/60' },
                { bg: '#0A0A0A', border: '1px solid #3f3f46', name: 'Negro Profundo', hex: '#0A0A0A', use: 'Fondos principales. Da peso y seriedad.',                     textColor: 'text-white',   hexColor: 'text-white/50' },
                { bg: '#FFFFFF', border: '1px solid #d4d4d8', name: 'Blanco',         hex: '#FFFFFF', use: 'Fondos secundarios. Texto sobre negro.',                       textColor: 'text-black',   hexColor: 'text-black/50' },
                { bg: '#D85A30', border: '',              name: 'Coral',         hex: '#D85A30', use: 'Solo para alertas. Especies en peligro crítico o en peligro.',     textColor: 'text-white',   hexColor: 'text-white/70' },
              ].map(({ bg, border, name, hex, use, textColor, hexColor }, i) => {
                const Wrapper = reduced ? 'div' : motion.div
                const motionProps = reduced ? {} : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: '-40px' },
                  transition: { duration: 0.4, ease: 'easeOut', delay: i * 0.1 },
                }
                return (
                  <Wrapper key={hex} {...motionProps as any} className="flex flex-col rounded-xl overflow-hidden">
                    <div className="h-40 rounded-xl" style={{ background: bg, border }} />
                    <div className="pt-3 pb-1">
                      <p className="text-sm font-semibold text-white">{name}</p>
                      <p className="text-xs font-mono text-zinc-400 mt-0.5">{hex}</p>
                      <p className="text-xs text-zinc-500 mt-1 leading-snug">{use}</p>
                    </div>
                  </Wrapper>
                )
              })}
            </div>
          </BrandSection>
          <RevealDivider />

          {/* Tipografías */}
          <FadeUp>
            <BrandSection title="Tipografías">
              <div className="space-y-5">
                <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-8 py-7">
                  <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Space Grotesk</span>
                    <span className="text-xs text-zinc-600">Títulos y logo</span>
                  </div>
                  <p className="font-grotesk text-6xl sm:text-7xl font-bold text-[#00E676] leading-none">RAYEN</p>
                </div>

                <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-8 py-7">
                  <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Inter</span>
                    <span className="text-xs text-zinc-600">Interfaz y cuerpo</span>
                  </div>
                  <p className="text-2xl sm:text-3xl text-zinc-300 leading-snug">
                    La biodiversidad de Chile en un solo lugar.
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-8 py-7">
                  <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Lora</span>
                    <span className="text-xs text-zinc-600">Nombres científicos</span>
                  </div>
                  <p className="font-serif italic text-2xl sm:text-3xl text-zinc-400 leading-snug">
                    Lapageria rosea
                  </p>
                </div>
              </div>
            </BrandSection>
          </FadeUp>
          <RevealDivider />

          {/* Tono de voz */}
          <FadeUp>
            <BrandSection title="Tono de voz" last>
              <p className="text-zinc-300 leading-relaxed text-lg max-w-2xl">
                Rayen habla de forma directa y cercana, sin tecnicismos innecesarios. No somos una
                institución — somos un proyecto independiente que cree que conocer la naturaleza es
                el primer paso para cuidarla. Usamos la segunda persona: tú, no usted. Preferimos
                frases cortas. Y nunca prometemos lo que aún no existe.
              </p>
            </BrandSection>
          </FadeUp>

        </div>
      </section>
    </main>
  )
}

// ── Componentes auxiliares ────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-stone-800 mb-3 pb-2 border-b border-stone-100">
        {title}
      </h2>
      {children}
    </section>
  )
}

function BrandSection({
  title,
  children,
  last = false,
}: {
  title: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div className={last ? 'pb-4' : 'pb-12'}>
      <h3 className="font-grotesk text-2xl font-semibold text-white mb-6">{title}</h3>
      {children}
    </div>
  )
}
