'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  cubicBezier,
} from 'framer-motion'

console.log('[HeroFrameExpand] módulo cargado')

const EASE = cubicBezier(0.25, 0.1, 0.25, 1)

export function HeroFrameExpand() {
  console.log('[HeroFrameExpand] componente montado')

  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()

  // window.scroll directo — evita problemas con useScroll/target en Next.js App Router
  const scrollProgress = useMotionValue(0)

  useEffect(() => {
    function onScroll() {
      const el = containerRef.current
      if (!el) return
      const total = el.offsetHeight - window.innerHeight
      const progress = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0
      console.log('[HeroFrameExpand] scrollProgress:', progress.toFixed(3))
      scrollProgress.set(progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [scrollProgress])

  // Animación en el primer 40% del recorrido (~100vh de scroll)
  const borderRadius = useTransform(scrollProgress, [0, 0.4], ['16px', '0px'], { ease: EASE })
  const scale = useTransform(scrollProgress, [0, 0.4], [0.88, 1], { ease: EASE })
  const boxShadow = useTransform(
    scrollProgress,
    [0, 0.4],
    ['0px 25px 60px rgba(0,0,0,0.55)', '0px 0px 0px rgba(0,0,0,0.00)'],
    { ease: EASE }
  )

  const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL

  return (
    // 250vh outer container — scroll travel space para la animación
    <div ref={containerRef} style={{ height: '250vh' }}>

      {/* Sticky: se queda fijo mientras el usuario scrollea a través de los 250vh */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0A0A]">

        {/* Frame animado — llena el sticky, scale crea los márgenes visuales */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={
            reduced
              ? { borderRadius: '0px', boxShadow: 'none' }
              : { borderRadius, scale, boxShadow }
          }
        >
          {/* Video background */}
          {videoUrl ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              aria-hidden="true"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="absolute inset-0 bg-carbon-900" />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-carbon-900/70" aria-hidden="true" />

          {/* Hero content */}
          <div className="relative z-10 h-full flex items-center text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-3xl">
                <p className="font-grotesk text-neon-400 text-sm font-medium uppercase tracking-wider mb-4">
                  Plataforma de biodiversidad chilena
                </p>
                <h1 className="font-grotesk text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
                  Chile florece <br />
                  <span className="text-neon-400">cuando lo conocemos.</span>
                </h1>
                <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-2xl">
                  Explora la fauna y flora nativa de Chile, conoce su estado de conservación
                  y descubre cómo cada especie sostiene los ecosistemas que también te sostienen a ti.
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    href="/mapa"
                    className="inline-flex items-center gap-2 bg-neon-400 hover:bg-neon-300 text-black font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    Explorar el mapa
                  </Link>
                  <Link
                    href="/especies"
                    className="inline-flex items-center gap-2 border border-neon-400/40 hover:border-neon-400 text-white/90 px-6 py-3 rounded-lg transition-colors"
                  >
                    Ver especies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
