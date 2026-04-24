'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Slide {
  titulo: string
  texto?: string
  lista?: string[]
  imagen?: string
  tipo?: 'actividad' | 'pregunta' | 'debate'
}

interface Props {
  titulo: string
  nivel: 'kinder' | 'basica' | 'media_baja' | 'media_alta'
  slides: Slide[]
}

// ── Estilos por nivel ────────────────────────────────────────

function SlideContent({ slide, nivel }: { slide: Slide; nivel: Props['nivel'] }) {
  const isActividad = slide.tipo === 'actividad'
  const isPregunta  = slide.tipo === 'pregunta'
  const isDebate    = slide.tipo === 'debate'

  const wrapperClass = cn(
    'flex flex-col items-center justify-center w-full h-full px-8 md:px-16 text-center',
    isActividad && 'bg-[#00E676]/10',
    (isPregunta || isDebate) && nivel !== 'kinder' && nivel !== 'basica' && 'items-start text-left'
  )

  if (nivel === 'kinder') {
    return (
      <div className={wrapperClass}>
        {(isPregunta || isActividad) && (
          <div className={cn(
            'mb-6 rounded-full px-4 py-1.5 text-sm font-semibold',
            isActividad ? 'bg-[#00E676] text-black' : 'bg-zinc-800 text-[#00E676]'
          )}>
            {isActividad ? 'Actividad' : 'Pregunta'}
          </div>
        )}
        <h2 className="font-grotesk font-black text-6xl md:text-8xl text-white leading-none mb-8">
          {slide.titulo}
        </h2>
        {slide.texto && (
          <p className={cn(
            'text-zinc-200 max-w-3xl leading-relaxed',
            isActividad ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
          )}>
            {slide.texto}
          </p>
        )}
      </div>
    )
  }

  if (nivel === 'basica') {
    return (
      <div className={wrapperClass}>
        {(isPregunta) && (
          <div className="mb-6 rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-semibold text-[#00E676]">
            Pregunta
          </div>
        )}
        <h2 className="font-grotesk font-bold text-5xl md:text-6xl text-white leading-tight mb-8">
          {slide.titulo}
        </h2>
        {slide.texto && (
          <p className="text-zinc-200 text-2xl md:text-3xl max-w-3xl leading-relaxed">
            {slide.texto}
          </p>
        )}
        {slide.lista && (
          <ul className="text-left space-y-3 text-2xl text-zinc-200 max-w-2xl">
            {slide.lista.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#00E676] mt-1 flex-shrink-0">•</span>
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
        'flex flex-col justify-center w-full h-full px-8 md:px-16',
        isPregunta ? 'border-l-4 border-[#00E676] pl-10 md:pl-14' : 'items-center text-center'
      )}>
        {isPregunta && (
          <p className="text-[#00E676] text-xs font-semibold uppercase tracking-widest mb-4">
            Para analizar
          </p>
        )}
        <h2 className="font-grotesk font-bold text-4xl md:text-5xl text-white leading-tight mb-6">
          {slide.titulo}
        </h2>
        {slide.texto && (
          <p className="text-zinc-200 text-xl md:text-2xl max-w-4xl leading-relaxed">
            {slide.texto}
          </p>
        )}
        {slide.lista && (
          <ol className="space-y-3 text-xl text-zinc-200 max-w-3xl">
            {slide.lista.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#00E676] font-bold font-grotesk flex-shrink-0 w-6">{i + 1}.</span>
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
      'flex flex-col justify-center w-full h-full px-8 md:px-20',
      isDebate ? 'border-l-4 border-[#00E676] pl-10 md:pl-14' : ''
    )}>
      {isDebate && (
        <p className="text-[#00E676] text-xs font-semibold uppercase tracking-widest mb-4">
          Debate
        </p>
      )}
      <h2 className="font-grotesk font-bold text-3xl md:text-4xl text-white leading-tight mb-6">
        {slide.titulo}
      </h2>
      {slide.texto && (
        <p className={cn(
          'text-zinc-200 text-lg md:text-xl max-w-5xl leading-relaxed',
          isDebate && 'italic'
        )}>
          {slide.texto}
        </p>
      )}
      {slide.lista && (
        <ul className="space-y-2 text-lg text-zinc-200 max-w-4xl">
          {slide.lista.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-[#00E676] font-bold flex-shrink-0">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────

export function ModoPizarra({ titulo, nivel, slides }: Props) {
  const [modo, setModo]         = useState<'preview' | 'pizarra'>('preview')
  const [current, setCurrent]   = useState(0)
  const [direction, setDirection] = useState(1)
  const prefersReduced = useReducedMotion()

  const total = slides.length

  const irA = useCallback((idx: number, dir: number) => {
    setDirection(dir)
    setCurrent(Math.max(0, Math.min(total - 1, idx)))
  }, [total])

  const anterior = useCallback(() => irA(current - 1, -1), [current, irA])
  const siguiente = useCallback(() => irA(current + 1, 1), [current, irA])

  // Teclado
  useEffect(() => {
    if (modo !== 'pizarra') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') siguiente()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   anterior()
      if (e.key === 'Escape') setModo('preview')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modo, siguiente, anterior])

  // Fullscreen al entrar en modo pizarra
  function iniciarPizarra() {
    setModo('pizarra')
    setCurrent(0)
    try {
      document.documentElement.requestFullscreen?.()
    } catch {
      // Silencioso — algunos navegadores lo bloquean sin gesto previo
    }
  }

  function salirPizarra() {
    setModo('preview')
    try {
      if (document.fullscreenElement) document.exitFullscreen?.()
    } catch {}
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
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col select-none">
        {/* Barra superior */}
        <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
          <p className="text-zinc-700 text-sm font-grotesk font-medium truncate max-w-xs">
            {titulo}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-sm tabular-nums">
              {current + 1} / {total}
            </span>
            <button
              onClick={salirPizarra}
              className="text-zinc-600 hover:text-white transition-colors"
              aria-label="Salir del modo pizarra"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Slide */}
        <div className="flex-1 relative overflow-hidden">
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
              <SlideContent slide={slides[current]} nivel={nivel} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-center gap-6 pb-6 flex-shrink-0">
          <button
            onClick={anterior}
            disabled={current === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => irA(i, i > current ? 1 : -1)}
                className={cn(
                  'rounded-full transition-all',
                  i === current
                    ? 'w-4 h-1.5 bg-[#00E676]'
                    : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500'
                )}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={siguiente}
            disabled={current === total - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Slide siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }

  // ── MODO PREVIEW ────────────────────────────────────────────
  return (
    <div>
      {/* Botón iniciar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-3xl text-white">{titulo}</h1>
          <p className="text-zinc-500 text-sm mt-1">{total} slides</p>
        </div>
        <button
          onClick={iniciarPizarra}
          className="flex items-center gap-2 rounded-lg bg-[#00E676] hover:bg-[#00c85e] px-5 py-2.5 text-sm font-semibold text-black transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
          Iniciar presentación
        </button>
      </div>

      {/* Listado de slides */}
      <div className="flex flex-col gap-3">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); iniciarPizarra() }}
            className="group text-left flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600 px-5 py-4 transition-colors"
          >
            <span className="text-zinc-600 text-sm font-grotesk font-medium w-6 flex-shrink-0 pt-0.5">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium group-hover:text-[#00E676] transition-colors truncate">
                {slide.titulo}
              </p>
              {slide.texto && (
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{slide.texto}</p>
              )}
              {slide.tipo && (
                <span className={cn(
                  'inline-block mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  slide.tipo === 'actividad' ? 'bg-[#00E676]/10 text-[#00E676]' :
                  slide.tipo === 'debate'    ? 'bg-zinc-800 text-zinc-400' :
                  'bg-zinc-800 text-zinc-400'
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
