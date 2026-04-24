'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion, cubicBezier } from 'framer-motion'

const EASE = cubicBezier(0.25, 0.1, 0.25, 1)

export function HeroFrameExpand() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Animated frame properties: scroll 0→0.6 drives the full expansion
  const frameOffset = useTransform(scrollYProgress, [0, 0.6], ['40px', '0px'], { ease: EASE })
  const borderRadius = useTransform(scrollYProgress, [0, 0.6], ['16px', '0px'], { ease: EASE })
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.88, 1], { ease: EASE })
  const boxShadow = useTransform(
    scrollYProgress,
    [0, 0.6],
    ['0px 25px 60px rgba(0,0,0,0.50)', '0px 0px 0px rgba(0,0,0,0.00)'],
    { ease: EASE }
  )

  const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL

  return (
    // 250vh outer container — provides scroll travel space for the animation
    <div ref={containerRef} style={{ height: '250vh' }}>

      {/* Sticky inner: stays fixed in viewport while user scrolls through 250vh */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0A0A]">

        {/* Animated frame */}
        <motion.div
          className="absolute overflow-hidden"
          style={
            reduced
              ? { top: 0, left: 0, right: 0, bottom: 0, borderRadius: '0px', scale: 1, boxShadow: 'none' }
              : { top: frameOffset, left: frameOffset, right: frameOffset, bottom: frameOffset, borderRadius, scale, boxShadow }
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

          {/* Hero content — static, never animates */}
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
