'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  cubicBezier,
} from 'framer-motion'

console.log('[HeroFrameExpand] módulo cargado')

const EASE = cubicBezier(0.16, 1, 0.3, 1)

export function HeroFrameExpand() {
  console.log('[HeroFrameExpand] componente montado')

  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()
  const { data: session } = useSession()
  const reportHref = session
    ? '/avistamientos/nuevo'
    : '/login?callbackUrl=/avistamientos/nuevo&razon=reporte'

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

  // Animación en el primer 70% del recorrido (~91vh de scroll en container 130vh)
  const borderRadius = useTransform(scrollProgress, [0, 0.7], ['16px', '0px'], { ease: EASE })
  const scale = useTransform(scrollProgress, [0, 0.7], [0.88, 1], { ease: EASE })
  const boxShadow = useTransform(
    scrollProgress,
    [0, 0.7],
    ['0px 25px 60px rgba(0,0,0,0.55)', '0px 0px 0px rgba(0,0,0,0.00)'],
    { ease: EASE }
  )

  const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL

  // Contenido del hero — layout diferenciado para móvil y desktop
  const heroContent = (mobile: boolean) => (
    <>
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

      {/* Text content */}
      {/* Móvil: relative + min-h para que el contenido pueda crecer sin cortarse */}
      {/* Desktop: absolute inset-0 para cubrir el frame animado */}
      <div className={
        mobile
          ? 'relative z-10 min-h-[100svh] flex flex-col items-center justify-center text-center text-white px-6 py-16'
          : 'absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-6 md:px-16'
      }>
        <p className="font-grotesk text-neon-400 text-sm font-medium uppercase tracking-wider mb-4">
          Plataforma de biodiversidad chilena
        </p>
        <h1 className="font-grotesk text-5xl md:text-7xl font-bold leading-tight tracking-tight">
          Chile florece <br />
          <span className="text-neon-400">cuando lo conocemos.</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
          Explora la fauna y flora nativa de Chile, conoce su estado de conservación
          y descubre cómo cada especie sostiene los ecosistemas que también te sostienen a ti.
        </p>
        {/* Botones: en móvil apilados en columna con pb-16; en desktop en fila */}
        <div className={
          mobile
            ? 'mt-8 flex flex-col items-center gap-3 w-full pb-16'
            : 'mt-8 flex flex-row gap-4 justify-center'
        }>
          <Link
            href="/mapa"
            className={
              mobile
                ? 'inline-flex items-center justify-center gap-2 w-full max-w-xs bg-neon-400 hover:bg-neon-300 text-black font-medium px-8 py-3 rounded-lg transition-colors'
                : 'inline-flex items-center justify-center gap-2 bg-neon-400 hover:bg-neon-300 text-black font-medium px-8 py-3 rounded-lg transition-colors'
            }
          >
            Explorar el mapa
          </Link>
          <Link
            href="/especies"
            className={
              mobile
                ? 'inline-flex items-center justify-center gap-2 w-full max-w-xs border border-neon-400/40 hover:border-neon-400 text-white/90 px-8 py-3 rounded-lg transition-colors'
                : 'inline-flex items-center justify-center gap-2 border border-neon-400/40 hover:border-neon-400 text-white/90 px-8 py-3 rounded-lg transition-colors'
            }
          >
            Ver especies
          </Link>
          <Link
            href={reportHref}
            className={
              mobile
                ? 'inline-flex items-center justify-center gap-2 w-full max-w-xs border border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black px-8 py-3 rounded-lg transition-colors'
                : 'inline-flex items-center justify-center gap-2 border border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black px-8 py-3 rounded-lg transition-colors'
            }
            style={{ borderWidth: '1.5px' }}
          >
            Reportar avistamiento
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* ── Móvil: sin animación sticky — el contenido determina la altura ── */}
      <div className="sm:hidden relative bg-[#0A0A0A]">
        {heroContent(true)}
      </div>

      {/* ── Desktop: animación frame-expand con sticky ── */}
      <div ref={containerRef} className="hidden sm:block" style={{ height: '130vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0A0A]">
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={
              reduced
                ? { borderRadius: '0px', boxShadow: 'none' }
                : { borderRadius, scale, boxShadow }
            }
          >
            {heroContent(false)}
          </motion.div>
        </div>
      </div>
    </>
  )
}
