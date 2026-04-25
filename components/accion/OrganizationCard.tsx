'use client'

import { motion } from 'framer-motion'

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
  'aves-chile':                   { foco: 'Aves nativas',                    zona: 'Todo Chile' },
  'centro-conservacion-cetaceos': { foco: 'Cetáceos y mamíferos marinos',    zona: 'Zona costera' },
  'codeff':                       { foco: 'Fauna y flora silvestre',          zona: 'Todo Chile' },
  'conaf':                        { foco: 'Áreas silvestres protegidas',      zona: 'Todo Chile' },
  'fundacion-bosque-nativo':      { foco: 'Bosque nativo',                   zona: 'Zona sur' },
  'ieb':                          { foco: 'Investigación en biodiversidad',   zona: 'Todo Chile' },
  'ministerio-medio-ambiente':    { foco: 'Política ambiental',              zona: 'Todo Chile' },
  'ong-ballena-azul':             { foco: 'Cetáceos y mamíferos marinos',    zona: 'Zona costera' },
  'red-observadores-aves':        { foco: 'Observación de aves',             zona: 'Todo Chile' },
  'sbap':                         { foco: 'Áreas protegidas',                zona: 'Todo Chile' },
  'universidad-austral':          { foco: 'Investigación ambiental',         zona: 'Zona sur' },
  'fundacion-rewilding-chile':    { foco: 'Rewilding y restauración',        zona: 'Patagonia' },
}

function LeafIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C12 2 7 1.5 3.5 5C1.5 7 2 11 2 11C2 11 6 11.5 8.5 9C12 5.5 12 2 12 2Z"
        fill="#00E676"
      />
      <path d="M2 11L5.5 7.5" stroke="#00E676" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 1.5C5.07 1.5 3.5 3.07 3.5 5C3.5 7.63 7 12.5 7 12.5C7 12.5 10.5 7.63 10.5 5C10.5 3.07 8.93 1.5 7 1.5Z"
        fill="#00E676"
      />
      <circle cx="7" cy="5" r="1.4" fill="#0A0A0A" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="7" cy="7" rx="2.5" ry="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 7h11" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="3" width="11" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 4l5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.2" />
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
  'uach-ies':                      '/logos/uach.png',
  'universidad-austral':           '/logos/uach.png',
  'wcs-chile':                     '/logos/wcs-chile.webp',
  'wildlife-conservation-society': '/logos/wcs-chile.webp',
  'wwf-chile':                     '/logos/wwf.png',
}

const lightBgLogos = [
  'oceana-chile', 'wwf-chile', 'tompkins-conservation',
  'fundacion-bosque-nativo', 'centro-cultural-bosque-nativo',
  'conaf', 'ieb-chile', 'ieb', 'wcs-chile', 'wildlife-conservation-society', 'uach-ies', 'universidad-austral',
]

export function OrganizationCard({ org, index }: Props) {
  const meta = (org.slug ? orgMeta[org.slug] : undefined) ?? { foco: 'Conservación ambiental', zona: 'Chile' }
  const typeLabel = ORG_TYPE_LABELS[org.type] ?? org.type
  const logoSrc = org.slug ? (logoMap[org.slug] ?? null) : null
  const isLight = org.slug ? lightBgLogos.includes(org.slug) : false
  const logoBg = isLight ? 'bg-white' : 'bg-zinc-800'

  const initials = org.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex gap-8 items-start w-full bg-zinc-900 border border-zinc-800 border-l-[3px] border-l-[#00E676] rounded-2xl p-7 hover:bg-zinc-800/50 hover:border-zinc-700 hover:border-l-[#00E676] transition-all duration-300">
      {/* Columna logo */}
      <div className="flex-shrink-0 flex flex-col items-center">
        {logoSrc ? (
          <div className={`w-20 h-20 rounded-2xl ${logoBg} p-2 flex items-center justify-center ring-1 ring-zinc-700`}>
            <img src={logoSrc} alt={org.name} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-zinc-800 ring-1 ring-zinc-700 flex items-center justify-center">
            <span className="font-grotesk font-bold text-[#00E676] text-xl">{initials}</span>
          </div>
        )}
        <span className="text-[10px] text-center mt-2 rounded-full px-2 py-0.5 bg-zinc-800 text-zinc-500">
          {typeLabel}
        </span>
      </div>

      {/* Columna contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Fila 1 — Nombre + badge Nacional */}
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-grotesk font-bold text-xl text-white leading-tight">
            {org.name}
          </h3>
          {org.national && (
            <span className="text-[10px] bg-zinc-800 text-zinc-500 rounded-full px-2 py-0.5">
              Nacional
            </span>
          )}
        </div>

        {/* Fila 2 — Descripción */}
        {org.description && (
          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 mt-2 font-inter">
            {org.description}
          </p>
        )}

        {/* Separador */}
        <hr className="border-zinc-800 my-4" />

        {/* Fila 3 — Foco y Zona en grid 2 columnas */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.08 + 0.2 }}
        >
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">
              Foco principal
            </p>
            <span className="bg-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 flex items-center gap-2 w-fit">
              <LeafIcon />
              {meta.foco}
            </span>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">
              Zona de acción
            </p>
            <span className="bg-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 flex items-center gap-2 w-fit">
              <PinIcon />
              {meta.zona}
            </span>
          </div>
        </motion.div>

        {/* Fila 4 — Links */}
        {(org.website || org.email) && (
          <div className="flex gap-4 mt-4">
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#00E676] transition-colors"
              >
                <GlobeIcon />
                Sitio web
              </a>
            )}
            {org.email && (
              <a
                href={`mailto:${org.email}`}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#00E676] transition-colors"
              >
                <MailIcon />
                Contacto
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
