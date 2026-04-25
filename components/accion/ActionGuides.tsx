'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { guides } from '@/lib/guides-data'
import type { Guide } from '@/lib/guides-data'

const CATEGORY_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'Vida cotidiana', label: 'Vida cotidiana' },
  { value: 'Naturaleza', label: 'Naturaleza' },
  { value: 'Comunidad', label: 'Comunidad' },
]

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function BarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="14" width="4" height="8" rx="1" />
      <rect x="10" y="8" width="4" height="14" rx="1" />
      <rect x="18" y="2" width="4" height="20" rx="1" />
    </svg>
  )
}

function GuideCardItem({ guide, index }: { guide: Guide; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  })
  const numberY = useTransform(scrollYProgress, [0, 1], [-20, 20])
  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      className="w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors duration-300 min-h-[420px]"
    >
      <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} min-h-[420px]`}>
        {/* Lado imagen — 40% */}
        <div className="relative md:w-2/5 min-h-[280px] md:min-h-[420px] flex-shrink-0">
          <Image
            src={guide.imageUrl}
            alt={guide.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
          <span className="absolute top-4 left-4 bg-[#00E676] text-black text-xs font-semibold rounded-full px-3 py-1 z-10">
            {guide.category}
          </span>
        </div>

        {/* Lado texto — 60% */}
        <div className="relative md:w-3/5 p-8 md:p-12 flex flex-col justify-between overflow-hidden">
          {/* Número decorativo con parallax */}
          <motion.span
            style={{ y: numberY, opacity: 0.15 }}
            className="absolute top-2 right-4 font-grotesk font-extrabold text-[80px] leading-none select-none pointer-events-none text-[#00E676]"
            aria-hidden
          >
            {String(index + 1).padStart(2, '0')}
          </motion.span>

          <div className="relative z-10">
            <p className="text-[#00E676] text-xs font-medium tracking-widest uppercase mb-3">
              {guide.category}
            </p>
            <h3
              className="font-grotesk font-bold text-3xl md:text-4xl text-white leading-tight mb-4 pr-8"
            >
              {guide.title}
            </h3>
            <p className="text-zinc-400 text-base leading-relaxed line-clamp-4">
              {guide.description}
            </p>
          </div>

          <div className="relative z-10 mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 bg-zinc-800 rounded-full px-3 py-1 text-xs text-zinc-300">
                <ClockIcon />
                {guide.estimatedTime}
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-800 rounded-full px-3 py-1 text-xs text-zinc-300">
                <BarIcon />
                {guide.difficulty}
              </span>
            </div>
            <Link
              href={`/accion/guias/${guide.slug}`}
              className="text-[#00E676] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all duration-200 flex-shrink-0"
            >
              Ver guía →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ActionGuides() {
  const [categoryFilter, setCategoryFilter] = useState('')

  const filtered = categoryFilter
    ? guides.filter(g => g.category === categoryFilter)
    : guides

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORY_FILTERS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setCategoryFilter(opt.value)}
            className={`
              text-sm px-3 py-1.5 rounded-lg font-medium transition-colors
              ${categoryFilter === opt.value
                ? 'bg-[#00E676] text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid editorial full-width */}
      <div className="flex flex-col gap-6">
        {filtered.map((guide, index) => (
          <GuideCardItem key={guide.slug} guide={guide} index={index} />
        ))}
      </div>
    </div>
  )
}
