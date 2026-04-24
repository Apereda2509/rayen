import { ExternalLink } from 'lucide-react'

interface Guide {
  title: string
  description: string
  steps?: string[]
  contact?: { label: string; href: string }
}

const guides: Guide[] = [
  {
    title: 'Cómo reportar un avistamiento de especie amenazada',
    description: 'Si encuentras un animal herido o ves una especie en peligro, estos son los pasos y contactos correctos.',
    steps: [
      'Fotografía el animal sin acercarte.',
      'Anota la ubicación exacta con coordenadas GPS.',
      'Llama al SAG: 600 450 4200.',
      'Reporta en Rayen con foto y ubicación.',
    ],
    contact: { label: 'SAG — 600 450 4200', href: 'tel:6004504200' },
  },
  {
    title: 'Qué hacer si encuentras fauna silvestre herida',
    description: 'No toques al animal. Estas organizaciones de rescate pueden ayudarte en todo Chile.',
    steps: [
      'Mantén distancia y evita el contacto directo.',
      'Fotografía al animal y anota su ubicación.',
      'Llama al CONAF (130) para orientación inmediata.',
      'Si está en zona urbana, puedes contenerlo con una caja ventilada.',
    ],
    contact: { label: 'CONAF — conaf.cl/contacto', href: 'https://www.conaf.cl' },
  },
  {
    title: 'Cómo denunciar tala ilegal o daño ambiental',
    description: 'La tala ilegal es uno de los principales daños a la biodiversidad. Puedes denunciarla de forma anónima.',
    steps: [
      'Documenta con fotos sin exponerte.',
      'Anota coordenadas GPS del lugar.',
      'Denuncia en la Superintendencia del Medio Ambiente.',
    ],
    contact: { label: 'SMA — sma.gob.cl', href: 'https://www.sma.gob.cl/index.php/sma/denuncias' },
  },
  {
    title: 'Plantas nativas para tu jardín o balcón',
    description: 'Plantar especies nativas atrae fauna local, consume menos agua y fortalece el ecosistema de tu barrio.',
    steps: [
      'Elige especies de tu región: Copihue, Quillay, Boldo, Maqui o Peumo.',
      'Consulta el vivero CONAF más cercano para obtener plantas.',
      'Evita plaguicidas — atrae polinizadores nativos.',
    ],
    contact: { label: 'CONAF — viveros de plantas nativas', href: 'https://www.conaf.cl' },
  },
  {
    title: 'Cómo participar en ciencia ciudadana',
    description: 'Tu celular es una herramienta científica. Estas plataformas usan tus observaciones para investigar la biodiversidad.',
    steps: [
      'Descarga iNaturalist y fotografía especies en tu entorno.',
      'Para aves, usa eBird Chile — muy valorado por científicos.',
      'Participa en bioblitz del Museo de Historia Natural.',
      'Tus registros alimentan bases de datos como GBIF.',
    ],
    contact: { label: 'iNaturalist — inaturalist.org', href: 'https://www.inaturalist.org/observations?place_id=7259' },
  },
  {
    title: 'Organizaciones donde puedes ser voluntario',
    description: 'Estas organizaciones buscan voluntarios para trabajo de campo, educación ambiental y conservación activa.',
    steps: [
      'WWF Chile: campañas de conservación y voluntariado.',
      'Fundación Plantemos para el Planeta: reforestación.',
      'CODEFF: defensa de la fauna nativa.',
    ],
    contact: { label: 'WWF Chile — wwf.cl', href: 'https://www.wwf.cl' },
  },
]

export function ActionGuides() {
  return (
    <div>
      <p className="text-sm text-zinc-500 mb-6">
        Herramientas concretas para actuar por la biodiversidad de Chile — desde tu jardín
        hasta una denuncia ambiental.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide, index) => (
          <div
            key={guide.title}
            className="relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-all flex flex-col gap-3"
          >
            {/* Número esquina superior derecha */}
            <span
              className="absolute top-4 right-5 font-grotesk font-bold text-5xl leading-none select-none pointer-events-none"
              style={{ color: '#00E676', opacity: 0.15 }}
              aria-hidden
            >
              {index + 1}
            </span>

            <h3 className="font-grotesk font-semibold text-white text-base leading-snug pr-10">
              {guide.title}
            </h3>

            <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
              {guide.description}
            </p>

            {guide.steps && (
              <ol className="space-y-1.5 flex-1">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-400">
                    <span
                      className="flex-shrink-0 font-grotesk font-semibold text-xs mt-0.5 w-4"
                      style={{ color: '#00E676' }}
                    >
                      {i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}

            {guide.contact && (
              <a
                href={guide.contact.href}
                target={guide.contact.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-auto pt-1"
              >
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                {guide.contact.label}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
