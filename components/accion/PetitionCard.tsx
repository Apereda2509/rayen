'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

interface Petition {
  id: string
  slug: string
  title: string
  description: string
  goal: number
  signedCount: number
  imageUrl: string | null
  active: boolean
  organization: {
    name: string
    slug: string
    logoUrl: string | null
  } | null
  species: {
    slug: string
    commonName: string
    uicnStatus: string | null
  } | null
}

interface Props {
  petition: Petition
  index?: number
}

export function PetitionCard({ petition, index = 0 }: Props) {
  const [imgError, setImgError] = useState(false)
  const reduced = useReducedMotion()

  const progress = petition.goal > 0
    ? Math.min((petition.signedCount / petition.goal) * 100, 100)
    : 0

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
    >
      <Link href={`/accion/peticiones/${petition.slug}`} className="block group">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer h-full"
        >
          {/* Imagen superior 16:9 */}
          <div className="relative w-full aspect-video overflow-hidden">
            {petition.imageUrl && !imgError ? (
              <>
                <img
                  src={petition.imageUrl}
                  alt={petition.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={() => setImgError(true)}
                  referrerPolicy="no-referrer"
                />
                {/* Overlay degradado sutil */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-900/70 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center px-4">
                <span
                  className="text-zinc-500 text-sm text-center"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  {petition.title}
                </span>
              </div>
            )}

            {/* Badge activa */}
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-bold text-black bg-[#00E676] px-2.5 py-0.5 rounded-full">
                Activa
              </span>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-5 flex flex-col">
            <h3
              className="font-semibold text-white text-lg leading-snug mb-2 line-clamp-2"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              {petition.title}
            </h3>

            <p
              className="text-zinc-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              {petition.description}
            </p>

            {/* Footer */}
            {petition.organization && (
              <p className="text-zinc-500 text-xs mb-3 truncate">
                Dirigida a: {petition.organization.name}
              </p>
            )}

            {/* Barra de progreso */}
            <div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-1.5">
                <div
                  className="h-full bg-[#00E676] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500">
                {petition.signedCount.toLocaleString('es-CL')} / {petition.goal.toLocaleString('es-CL')} firmas
              </p>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
