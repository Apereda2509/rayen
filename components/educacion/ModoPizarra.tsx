'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  IlustracionActividad,
  IlustracionPregunta,
  IlustracionDebate,
} from './SlideIlustracion'

export interface Slide {
  titulo: string
  texto?: string
  lista?: string[]
  imagen?: string
  tipo?: 'actividad' | 'pregunta' | 'debate'
}

type Nivel = 'kinder' | 'basica' | 'media_baja' | 'media_alta'

interface Props {
  titulo: string
  nivel: Nivel
  slides: Slide[]
  speciesImageUrl?: string | null
  speciesScientificName?: string | null
}

// ── Zona izquierda: imagen o SVG ─────────────────────────────

function ZonaImagen({
  slide,
  speciesImageUrl,
  speciesScientificName,
}: {
  slide: Slide
  speciesImageUrl?: string | null
  speciesScientificName?: string | null
}) {
  const tipo = slide.tipo

  // Slides especiales: SVG en lugar de foto
  if (tipo === 'actividad') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 p-8">
        <IlustracionActividad />
      </div>
    )
  }
  if (tipo === 'pregunta') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 p-8">
        <IlustracionPregunta />
      </div>
    )
  }
  if (tipo === 'debate') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 p-8">
        <IlustracionDebate />
      </div>
    )
  }

  // Slide normal: foto de la especie
  if (speciesImageUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={speciesImageUrl}
          alt={speciesScientificName ?? ''}
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
        />
        {/* Overlay gradiente inferior */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Nombre científico */}
        {speciesScientificName && (
          <p className="absolute bottom-3 left-4 font-serif text-sm italic text-white/70 leading-snug">
            {speciesScientificName}
          </p>
        )}
      </div>
    )
  }

  // Sin imagen: fondo neutro
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900">
      <div className="h-16 w-16 rounded-full border border-zinc-700" />
    </div>
  )
}

// ── Fondo decorativo por nivel ───────────────────────────────

function FondoDecorativo({ nivel }: { nivel: Nivel }) {
  if (nivel === 'kinder') {
    return (
      <>
        {/* Borde redondeado sutil */}
        <div className="pointer-events-none absolute inset-2 rounded-2xl border border-[#00E676]/20" />
        {/* Círculos en las esquinas */}
        <div className="pointer-events-none absolute top-5 left-5 h-10 w-10 rounded-full bg-[#00E676] opacity-[0.07]" />
        <div className="pointer-events-none absolute top-5 right-5 h-7 w-7 rounded-full bg-[#00E676] opacity-[0.07]" />
        <div className="pointer-events-none absolute bottom-5 left-5 h-12 w-12 rounded-full bg-[#00E676] opacity-[0.06]" />
        <div className="pointer-events-none absolute bottom-5 right-5 h-8 w-8 rounded-full bg-[#00E676] opacity-[0.07]" />
        <div className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 rounded-full bg-[#00E676] opacity-[0.05]" />
        <div className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 rounded-full bg-[#00E676] opacity-[0.05]" />
      </>
    )
  }

  if (nivel === 'basica') {
    return (
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dots-basica" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1.8" fill="#71717a" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-basica)" />
      </svg>
    )
  }

  // media_baja / media_alta: sin decoración de fondo
  return null
}

// ── Contenido de cada slide por nivel ────────────────────────

function SlideContent({ slide, nivel }: { slide: Slide; nivel: Nivel }) {
  const isPregunta  = slide.tipo === 'pregunta'
  const isDebate    = slide.tipo === 'debate'
  const isActividad = slide.tipo === 'actividad'

  if (nivel === 'kinder') {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-8 md:px-12">
        {(isActividad || isPregunta) && (
          <span className={cn(
            'mb-5 rounded-full px-4 py-1.5 text-sm font-semibold',
            isActividad ? 'bg-[#00E676] text-black' : 'bg-zinc-800 text-[#00E676]'
          )}>
            {isActividad ? 'Actividad' : 'Pregunta'}
          </span>
        )}
        <h2 className="font-grotesk font-black text-5xl md:text-7xl text-white leading-none mb-8">
          {slide.titulo}
        </h2>
        {slide.texto && (
          <p className={cn(
            'text-zinc-200 max-w-lg leading-relaxed',
            isActividad ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'
          )}>
            {slide.texto}
          </p>
        )}
      </div>
    )
  }

  if (nivel === 'basica') {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-8 md:px-12">
        {isPregunta && (
          <span className="mb-5 rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-semibold text-[#00E676]">
            Pregunta
          </span>
        )}
        <h2 className="font-grotesk font-bold text-4xl md:text-5xl text-white leading-tight mb-7">
          {slide.titulo}
        </h2>
        {/* Separador */}
        <div className="mb-7 h-px w-12 bg-[#00E676]/30" />
        {slide.texto && (
          <p className="text-zinc-200 text-xl md:text-2xl max-w-lg leading-relaxed">
            {slide.texto}
          </p>
        )}
        {slide.lista && (
          <ul className="text-left space-y-3 text-xl text-zinc-200 max-w-lg">
            {slide.lista.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 text-[#00E676] flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  if (nivel === 'media_baja') {
    return (
      <div className={cn(
        'flex h-full flex-col justify-center px-8 md:px-14',
        isPregunta ? 'border-l-4 border-[#00E676] pl-10 md:pl-12' : 'items-center text-center'
      )}>
        {isPregunta && (
          <p className="mb-4 text-[#00E676] text-xs font-semibold uppercase tracking-widest">
            Para analizar
          </p>
        )}
        <h2 className="font-grotesk font-bold text-3xl md:text-4xl text-white leading-tight mb-5">
          {slide.titulo}
        </h2>
        {!isPregunta && <div className="mb-5 h-px w-10 bg-[#00E676]/30 self-center" />}
        {slide.texto && (
          <p className="text-zinc-200 text-lg md:text-xl max-w-2xl leading-relaxed">
            {slide.texto}
          </p>
        )}
        {slide.lista && (
          <ol className="space-y-3 text-lg text-zinc-200 max-w-xl">
            {slide.lista.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-grotesk font-bold text-[#00E676] flex-shrink-0 w-6">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    )
  }

  // media_alta
  return (
    <div className={cn(
      'flex h-full flex-col justify-center px-8 md:px-14',
      isDebate ? 'border-l-4 border-[#00E676] pl-10 md:pl-12' : ''
    )}>
      {isDebate && (
        <p className="mb-4 text-[#00E676] text-xs font-semibold uppercase tracking-widest">
          Debate
        </p>
      )}
      <h2 className="font-grotesk font-bold text-2xl md:text-3xl text-white leading-tight mb-5">
        {slide.titulo}
      </h2>
      {!isDebate && <div className="mb-5 h-px w-10 bg-[#00E676]/30" />}
      {slide.texto && (
        <p className={cn(
          'text-zinc-200 text-base md:text-lg max-w-2xl leading-relaxed',
          isDebate && 'italic'
        )}>
          {slide.texto}
        </p>
      )}
      {slide.lista && (
        <ul className="space-y-2 text-base md:text-lg text-zinc-200 max-w-2xl">
          {slide.lista.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="font-bold text-[#00E676] flex-shrink-0">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────

export function ModoPizarra({
  titulo,
  nivel,
  slides,
  speciesImageUrl,
  speciesScientificName,
}: Props) {
  const [modo, setModo]           = useState<'preview' | 'pizarra'>('preview')
  const [current, setCurrent]     = useState(0)
  const [direction, setDirection] = useState(1)
  const prefersReduced            = useReducedMotion()
  const total                     = slides.length

  const irA = useCallback((idx: number, dir: number) => {
    setDirection(dir)
    setCurrent(Math.max(0, Math.min(total - 1, idx)))
  }, [total])

  const anterior = useCallback(() => irA(current - 1, -1), [current, irA])
  const siguiente = useCallback(() => irA(current + 1,  1), [current, irA])

  useEffect(() => {
    if (modo !== 'pizarra') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') siguiente()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   anterior()
      if (e.key === 'Escape') salirPizarra()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, siguiente, anterior])

  function iniciarDesde(idx: number) {
    setCurrent(idx)
    setModo('pizarra')
    try { document.documentElement.requestFullscreen?.() } catch {}
  }

  function salirPizarra() {
    setModo('preview')
    try { if (document.fullscreenElement) document.exitFullscreen?.() } catch {}
  }

  const variants = prefersReduced
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
        animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' as const } },
        exit:    (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' as const } }),
      }

  // ── MODO PIZARRA ────────────────────────────────────────────
  if (modo === 'pizarra') {
    const slide = slides[current]
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0A] select-none">

        {/* Barra superior */}
        <div className="flex flex-shrink-0 items-center justify-between px-5 py-3 border-b border-zinc-900">
          <p className="font-grotesk font-medium text-sm text-zinc-600 truncate max-w-xs">{titulo}</p>
          <div className="flex items-center gap-5">
            <span className="text-zinc-500 text-sm tabular-nums">{current + 1} / {total}</span>
            <button
              onClick={salirPizarra}
              className="text-zinc-600 hover:text-white transition-colors"
              aria-label="Salir del modo pizarra"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Área del slide */}
        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0"
            >
              {/* Decoración de fondo (kinder/basica) */}
              <FondoDecorativo nivel={nivel} />

              {/* Layout dos zonas */}
              <div className="flex h-full flex-col md:flex-row">

                {/* Zona izquierda — imagen (h-48 móvil, 40% desktop) */}
                <div className="h-48 flex-shrink-0 overflow-hidden md:h-auto md:w-2/5">
                  <ZonaImagen
                    slide={slide}
                    speciesImageUrl={speciesImageUrl}
                    speciesScientificName={speciesScientificName}
                  />
                </div>

                {/* Zona derecha — contenido */}
                <div className="flex-1 overflow-y-auto">
                  <SlideContent slide={slide} nivel={nivel} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navegación inferior */}
        <div className="flex flex-shrink-0 items-center justify-center gap-5 border-t border-zinc-900 py-4">
          <button
            onClick={anterior}
            disabled={current === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => irA(i, i > current ? 1 : -1)}
                className={cn(
                  'rounded-full transition-all',
                  i === current
                    ? 'h-1.5 w-5 bg-[#00E676]'
                    : 'h-1.5 w-1.5 bg-zinc-700 hover:bg-zinc-500'
                )}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={siguiente}
            disabled={current === total - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Slide siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // ── MODO PREVIEW ────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-3xl text-white">{titulo}</h1>
          <p className="mt-1 text-sm text-zinc-500">{total} slides</p>
        </div>
        <button
          onClick={() => iniciarDesde(0)}
          className="flex items-center gap-2 rounded-lg bg-[#00E676] hover:bg-[#00c85e] px-5 py-2.5 text-sm font-semibold text-black transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
          Iniciar presentación
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => iniciarDesde(i)}
            className="group flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-left hover:border-zinc-600 transition-colors"
          >
            <span className="w-6 flex-shrink-0 pt-0.5 font-grotesk text-sm font-medium text-zinc-600">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white group-hover:text-[#00E676] transition-colors">
                {slide.titulo}
              </p>
              {slide.texto && (
                <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{slide.texto}</p>
              )}
              {slide.tipo && (
                <span className={cn(
                  'mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                  slide.tipo === 'actividad' ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-zinc-800 text-zinc-400'
                )}>
                  {slide.tipo}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
