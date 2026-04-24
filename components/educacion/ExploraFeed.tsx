'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface Articulo {
  id: string
  slug: string
  titulo: string
  subtitulo: string | null
  imagen_url: string | null
  tiempo_lectura: number
}

function PatronSVG({ numero }: { numero: string }) {
  const patternId = `diag-${numero}`
  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: 12 }}
    >
      <defs>
        <pattern
          id={patternId}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="20" stroke="#27272a" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} rx="12" />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="96"
        fontWeight="800"
        fontFamily="var(--font-space-grotesk), sans-serif"
        fill="#3f3f46"
        opacity="0.6"
      >
        {numero}
      </text>
    </svg>
  )
}

function ArticuloCard({ articulo, index }: { articulo: Articulo; index: number }) {
  const [hovered, setHovered] = useState(false)
  const reduced = useReducedMotion()
  const numero = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
      className="relative mt-6"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Folder tab */}
      <motion.div
        animate={{ width: hovered ? 128 : 96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute -top-6 left-0 h-6 bg-[#00E676] rounded-t-md flex items-center justify-center overflow-hidden"
        style={{ minWidth: 96 }}
      >
        <span
          className="text-black text-xs font-bold select-none whitespace-nowrap"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          {numero}
        </span>
      </motion.div>

      {/* Card */}
      <motion.div
        animate={{ scale: hovered ? 1.01 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          boxShadow: hovered
            ? '0 25px 50px -12px rgba(0, 230, 118, 0.08)'
            : '0 0 0 0 transparent',
        }}
        className="relative min-h-48 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
      >
        {/* Left border accent */}
        <motion.div
          animate={{ height: hovered ? '100%' : '0%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute left-0 top-0 w-1 bg-[#00E676] z-10"
        />

        <Link
          href={`/educacion/explora/${articulo.slug}`}
          className="flex h-full min-h-48"
        >
          {/* Left column */}
          <div className="flex-1 min-w-0 p-6 pl-7 flex flex-col justify-between">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">
                {articulo.tiempo_lectura} min de lectura
              </p>
              <h2
                className="font-bold text-3xl md:text-4xl text-white leading-tight"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                {articulo.titulo}
              </h2>
              {articulo.subtitulo && (
                <p
                  className="text-zinc-400 text-base line-clamp-2 mt-3"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  {articulo.subtitulo}
                </p>
              )}
            </div>
            <span
              className="text-[#00E676] text-sm mt-6 hover:underline self-start"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              Leer →
            </span>
          </div>

          {/* Right column — hidden on mobile */}
          <div className="hidden md:block w-[35%] shrink-0 p-4 pl-0">
            <div className="relative w-full h-full min-h-40 rounded-xl overflow-hidden">
              {articulo.imagen_url ? (
                <Image
                  src={articulo.imagen_url}
                  alt={articulo.titulo}
                  fill
                  className="object-cover"
                />
              ) : (
                <PatronSVG numero={numero} />
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default function ExploraFeed({ articulos }: { articulos: Articulo[] }) {
  return (
    <div className="flex flex-col gap-4">
      {articulos.map((a, i) => (
        <ArticuloCard key={a.id} articulo={a} index={i} />
      ))}
    </div>
  )
}
