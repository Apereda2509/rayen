'use client'

import { useEffect, useRef } from 'react'

const TECHS = [
  { name: 'Next.js',       icon: 'https://cdn.simpleicons.org/nextdotjs' },
  { name: 'Vercel',        icon: 'https://cdn.simpleicons.org/vercel' },
  { name: 'Supabase',      icon: 'https://cdn.simpleicons.org/supabase' },
  { name: 'Mapbox',        icon: 'https://cdn.simpleicons.org/mapbox' },
  { name: 'Framer Motion', icon: 'https://cdn.simpleicons.org/framer' },
  { name: 'Tailwind CSS',  icon: 'https://cdn.simpleicons.org/tailwindcss' },
  { name: 'TypeScript',    icon: 'https://cdn.simpleicons.org/typescript' },
  { name: 'Claude',        icon: 'https://cdn.simpleicons.org/anthropic' },
]

function LogoGroup() {
  return (
    <>
      {TECHS.map((tech, i) => (
        <div
          key={i}
          className="flex items-center flex-shrink-0"
          style={{ paddingLeft: '4rem', gap: '0.5rem' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tech.icon}
            alt=""
            height={28}
            width={28}
            className="tech-logo"
            aria-hidden="true"
          />
          <span className="font-inter text-sm text-zinc-500 whitespace-nowrap">
            {tech.name}
          </span>
        </div>
      ))}
    </>
  )
}

export function TechMarquee() {
  const groupRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const rafRef   = useRef<number>(0)

  useEffect(() => {
    const group = groupRef.current
    const inner = innerRef.current
    if (!group || !inner) return

    // Esperar a que los logos carguen antes de medir
    let x = 0
    const speed = 0.5
    let groupWidth = 0

    function measure() {
      groupWidth = group!.getBoundingClientRect().width
    }

    function animate() {
      if (document.visibilityState === 'hidden') {
        rafRef.current = requestAnimationFrame(animate)
        return
      }
      x -= speed
      if (x <= -groupWidth) x = 0
      inner!.style.transform = `translateX(${x}px)`
      rafRef.current = requestAnimationFrame(animate)
    }

    // Medir tras un frame para que el layout esté completo
    rafRef.current = requestAnimationFrame(() => {
      measure()
      animate()
    })

    // Re-medir en resize (fuentes variables, zoom)
    window.addEventListener('resize', measure, { passive: true })
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <section className="bg-[#0A0A0A] border-t border-b border-zinc-800 py-16">
      <p className="text-center font-inter text-sm text-zinc-500 uppercase tracking-widest mb-10">
        Construido con
      </p>

      <div
        className="overflow-hidden relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        }}
      >
        {/* inner: se mueve con translateX vía JS */}
        <div ref={innerRef} className="flex" style={{ willChange: 'transform' }}>
          {/* Grupo 1 — se mide para saber el ancho exacto */}
          <div ref={groupRef} className="flex flex-shrink-0">
            <LogoGroup />
          </div>
          {/* Grupo 2 — idéntico, ocupa el espacio cuando grupo 1 sale */}
          <div className="flex flex-shrink-0" aria-hidden="true">
            <LogoGroup />
          </div>
        </div>
      </div>
    </section>
  )
}
