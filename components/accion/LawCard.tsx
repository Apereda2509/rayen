'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  ley:                    { label: 'Ley',                    className: 'bg-blue-900/80 text-blue-300' },
  decreto:                { label: 'Decreto',                className: 'bg-amber-900/80 text-amber-300' },
  convenio_internacional: { label: 'Convenio Internacional', className: 'bg-purple-900/80 text-purple-300' },
}

const LAW_LOGO_MAP: Record<string, string> = {
  'cites':         '/logos/laws/cites.png',
  'diversidad':    '/logos/laws/cbd.png',
  'caza':          '/logos/laws/sag.png',
  'araucaria':     '/logos/laws/minagri.png',
  'bosque':        '/logos/laws/conaf.png',
  'humedales':     '/logos/laws/mma.png',
  'clasificación': '/logos/laws/mma.png',
  'sbap':          '/logos/laws/mma.png',
  'biodiversidad': '/logos/laws/mma.png',
}

function getLawLogo(name: string): string | null {
  const lower = name.toLowerCase()
  for (const [key, val] of Object.entries(LAW_LOGO_MAP)) {
    if (lower.includes(key)) return val
  }
  return null
}

function BuildingIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01M12 14h.01"/>
    </svg>
  )
}

function shortenEmisor(emisor: string | null): string {
  if (!emisor) return ''
  if (emisor.startsWith('ONU')) return 'ONU'
  if (emisor.includes('Ministerio del Medio Ambiente')) return 'Ministerio del Medio Ambiente'
  if (emisor.includes('Ministerio de Agricultura')) return 'Ministerio de Agricultura'
  if (emisor.includes('Ministerio de Bienes Nacionales')) return 'Ministerio de Bienes Nacionales'
  return emisor.split('—')[0].trim()
}

export interface Law {
  id: string
  name: string
  number: string
  year: number
  type: string
  description: string | null
  url: string | null
  emisor: string | null
  imageUrl: string | null
  shortDescription: string | null
  fullDescription: string | null
  relevance: string | null
}

interface Props {
  law: Law
  index?: number
}

export function LawCard({ law, index = 0 }: Props) {
  const router = useRouter()

  const badge = TYPE_BADGE[law.type] ?? { label: law.type, className: 'bg-zinc-800/80 text-zinc-300' }
  const emisorShort = shortenEmisor(law.emisor)
  const logoSrc = getLawLogo(law.name)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={() => router.push(`/accion/marco-legal/${law.id}`)}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col"
      >
        {/* Logo institucional sobre fondo blanco */}
        <div className="relative w-full aspect-video bg-white flex items-center justify-center p-8 flex-shrink-0">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={law.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span
              className="font-bold text-zinc-800 text-4xl"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              {law.name.slice(0, 2).toUpperCase()}
            </span>
          )}

          {/* Badge tipo — esquina superior izquierda */}
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {/* Año — esquina superior derecha */}
          <div className="absolute top-3 right-3">
            <span className="text-zinc-600 text-xs bg-zinc-100 rounded px-2 py-1">
              {law.year}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 flex flex-col flex-1">
          <h3
            className="font-semibold text-white text-base leading-snug line-clamp-2"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            {law.name}
          </h3>

          {emisorShort && (
            <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
              <BuildingIcon />
              <span className="truncate">{emisorShort}</span>
            </p>
          )}

          <p
            className="text-zinc-400 text-sm line-clamp-3 mt-2 leading-relaxed flex-1"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            {law.shortDescription ?? law.description ?? ''}
          </p>

          {/* Footer */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
            <span className="text-[#00E676] text-xs font-medium">Ver ficha →</span>
            {law.url && (
              <button
                className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(law.url!, '_blank', 'noopener,noreferrer')
                }}
              >
                Documento oficial ↗
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
