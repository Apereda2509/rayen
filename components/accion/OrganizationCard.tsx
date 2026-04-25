'use client'

import { motion, useReducedMotion } from 'framer-motion'

const ORG_TYPE_LABELS: Record<string, string> = {
  ong:           'ONG',
  fundacion:     'Fundación',
  universidad:   'Universidad',
  gobierno:      'Gobierno',
  empresa_b:     'Empresa B',
  activismo:     'Activismo',
  investigacion: 'Investigación',
}

const orgMeta: Record<string, { foco: string; zona: string }> = {
  'aves-chile':                   { foco: 'Aves nativas',                   zona: 'Todo Chile' },
  'ballena-azul':                 { foco: 'Cetáceos y mamíferos marinos',   zona: 'Zona costera' },
  'ccc-chile':                    { foco: 'Cetáceos y mamíferos marinos',   zona: 'Zona costera' },
  'centro-conservacion-cetaceos': { foco: 'Cetáceos y mamíferos marinos',   zona: 'Zona costera' },
  'codeff':                       { foco: 'Fauna y flora silvestre',         zona: 'Todo Chile' },
  'conaf':                        { foco: 'Áreas silvestres protegidas',     zona: 'Todo Chile' },
  'fundacion-bosque-nativo':      { foco: 'Bosque nativo',                  zona: 'Zona sur' },
  'ieb-chile':                    { foco: 'Investigación en biodiversidad',  zona: 'Todo Chile' },
  'ieb':                          { foco: 'Investigación en biodiversidad',  zona: 'Todo Chile' },
  'ministerio-medio-ambiente':    { foco: 'Política ambiental',             zona: 'Todo Chile' },
  'ong-ballena-azul':             { foco: 'Cetáceos y mamíferos marinos',   zona: 'Zona costera' },
  'oceana-chile':                 { foco: 'Océano y vida marina',           zona: 'Zona costera' },
  'red-observadores-aves':        { foco: 'Observación de aves',            zona: 'Todo Chile' },
  'rewilding-chile':              { foco: 'Rewilding y restauración',       zona: 'Patagonia' },
  'fundacion-rewilding-chile':    { foco: 'Rewilding y restauración',       zona: 'Patagonia' },
  'sbap':                         { foco: 'Áreas protegidas',               zona: 'Todo Chile' },
  'tompkins-conservation':        { foco: 'Rewilding y restauración',       zona: 'Patagonia' },
  'uach-ies':                     { foco: 'Investigación ambiental',        zona: 'Zona sur' },
  'universidad-austral':          { foco: 'Investigación ambiental',        zona: 'Zona sur' },
  'wcs-chile':                    { foco: 'Fauna silvestre',                zona: 'Todo Chile' },
  'wildlife-conservation-society':{ foco: 'Fauna silvestre',                zona: 'Todo Chile' },
  'wwf-chile':                    { foco: 'Biodiversidad global',           zona: 'Todo Chile' },
}

const logoMap: Record<string, string> = {
  'aves-chile':                    '/logos/aves-chile.png',
  'ballena-azul':                  '/logos/ballena-azul.png',
  'ccc-chile':                     '/logos/ccc.png',
  'centro-conservacion-cetaceos':  '/logos/ccc.png',
  'codeff':                        '/logos/codeff.svg',
  'conaf':                         '/logos/conaf.png',
  'fundacion-bosque-nativo':       '/logos/bosque-nativo.webp',
  'centro-cultural-bosque-nativo': '/logos/bosque-nativo.webp',
  'ieb-chile':                     '/logos/ieb.jpg',
  'ieb':                           '/logos/ieb.jpg',
  'ministerio-medio-ambiente':     '/logos/mma.png',
  'ong-ballena-azul':              '/logos/ballena-azul.png',
  'oceana-chile':                  '/logos/oceana.webp',
  'red-observadores-aves':         '/logos/roc.png',
  'rewilding-chile':               '/logos/rewilding-chile.png',
  'fundacion-rewilding-chile':     '/logos/rewilding-chile.png',
  'sbap':                          '/logos/sbap.svg',
  'tompkins-conservation':         '/logos/tompkins.svg',
  'uach-ies':                      '/logos/uach.jpg',
  'universidad-austral':           '/logos/uach.jpg',
  'wcs-chile':                     '/logos/wcs-chile.webp',
  'wildlife-conservation-society': '/logos/wcs-chile.webp',
  'wwf-chile':                     '/logos/wwf.png',
}

function LeafIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.5 1.5C9.5 1.5 5.5 1 2.5 4C1 5.5 1.5 8.5 1.5 8.5C1.5 8.5 4.5 9 6.5 7C9 4.5 9.5 1.5 9.5 1.5Z"
        fill="#00E676"
      />
      <path d="M1.5 8.5L4 6" stroke="#00E676" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.5" cy="5.5" r="4.2" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="5.5" cy="5.5" rx="2" ry="4.2" stroke="currentColor" strokeWidth="1" />
      <path d="M1.3 5.5h8.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

interface Organization {
  id: string
  slug: string | null
  name: string
  type: string
  description: string | null
  website: string | null
  email: string | null
  phone: string | null
  logoUrl: string | null
  national: boolean
  regionName: string | null
}

interface Props {
  org: Organization
  index: number
}

export function OrganizationCard({ org, index }: Props) {
  const reduced = useReducedMotion()
  const meta = (org.slug ? orgMeta[org.slug] : undefined) ?? { foco: 'Conservación ambiental', zona: 'Chile' }
  const typeLabel = ORG_TYPE_LABELS[org.type] ?? org.type
  const logoSrc = org.slug ? (logoMap[org.slug] ?? null) : null

  const initials = org.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleClick = () => {
    if (org.website) window.open(org.website, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={handleClick}
        className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-full flex flex-col ${org.website ? 'cursor-pointer' : ''}`}
      >
        {/* Bloque superior — logo cuadrado */}
        <div className="aspect-square w-full overflow-hidden">
          {logoSrc ? (
            <div className="w-full h-full bg-white flex items-center justify-center p-5">
              <img
                src={logoSrc}
                alt={org.name}
                className="object-contain max-h-full max-w-full"
                onError={(e) => {
                  const el = e.currentTarget
                  el.style.display = 'none'
                  const parent = el.parentElement!
                  parent.className = 'w-full h-full bg-zinc-800 flex items-center justify-center'
                  const span = document.createElement('span')
                  span.style.fontFamily = 'var(--font-space-grotesk), sans-serif'
                  span.style.fontWeight = '700'
                  span.style.fontSize = '1.875rem'
                  span.style.color = '#00E676'
                  span.textContent = initials
                  parent.appendChild(span)
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <span
                className="font-bold text-3xl text-[#00E676]"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Bloque inferior — contenido */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3
            className="font-semibold text-white text-sm leading-snug line-clamp-2"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            {org.name}
          </h3>

          <div className="flex gap-1.5 flex-wrap">
            <span className="bg-zinc-800 text-zinc-400 text-[10px] rounded-full px-2 py-0.5">
              {typeLabel}
            </span>
            {org.national && (
              <span className="bg-zinc-800 text-zinc-400 text-[10px] rounded-full px-2 py-0.5">
                Nacional
              </span>
            )}
          </div>

          {org.description && (
            <p
              className="text-zinc-400 text-xs leading-relaxed line-clamp-3"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              {org.description}
            </p>
          )}

          <div className="border-t border-zinc-800 mt-2 pt-2 flex flex-col gap-1.5">
            <span className="bg-zinc-800 rounded-full px-2.5 py-1 text-[10px] text-zinc-300 flex items-center gap-1.5 w-fit">
              <LeafIcon />
              {meta.foco}
            </span>

            {org.website && (
              <span className="text-zinc-500 hover:text-[#00E676] text-[10px] flex items-center gap-1 transition-colors w-fit">
                <GlobeIcon />
                Sitio web
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
