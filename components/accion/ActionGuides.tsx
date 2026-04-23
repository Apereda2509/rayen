import { Phone, AlertTriangle, TreePine, Droplets, MapPin, FlaskConical } from 'lucide-react'

interface Step {
  text: string
}

interface Contact {
  label: string
  value: string
  href?: string
}

interface Guide {
  icon: React.ElementType
  color: string
  title: string
  urgency: 'alta' | 'media' | 'baja'
  steps: Step[]
  contacts: Contact[]
}

const URGENCY_STYLES = {
  alta:  'bg-red-50 border-red-200',
  media: 'bg-amber-50 border-amber-200',
  baja:  'bg-teal-50 border-teal-200',
}

const URGENCY_LABELS = {
  alta:  'Urgente',
  media: 'Importante',
  baja:  'Voluntario',
}

const URGENCY_BADGE = {
  alta:  'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baja:  'bg-teal-100 text-teal-700',
}

const guides: Guide[] = [
  {
    icon: AlertTriangle,
    color: 'text-red-500',
    title: 'Encontré un animal herido',
    urgency: 'alta',
    steps: [
      { text: 'No toques ni muevas al animal sin guía — puede empeorar su estado o morderte.' },
      { text: 'Llama al CONAF (130) o SAG (800 600 000) para orientación inmediata.' },
      { text: 'Si es necesario, fotografía el animal y su entorno para el reporte.' },
      { text: 'Si el animal está en peligro inmediato en zona urbana, puedes contenerlo con una caja con ventilación.' },
    ],
    contacts: [
      { label: 'CONAF 24/7', value: '130', href: 'tel:130' },
      { label: 'SAG', value: '800 600 000', href: 'tel:800600000' },
    ],
  },
  {
    icon: AlertTriangle,
    color: 'text-orange-500',
    title: 'Vi caza o captura ilegal',
    urgency: 'alta',
    steps: [
      { text: 'No te enfrentes a los cazadores — tu seguridad es primero.' },
      { text: 'Documenta discretamente: hora, lugar, descripción de personas y vehículos.' },
      { text: 'Llama al SAG o PDI con la información recabada.' },
      { text: 'Puedes hacer la denuncia en forma anónima.' },
    ],
    contacts: [
      { label: 'SAG', value: '800 600 000', href: 'tel:800600000' },
      { label: 'PDI', value: '134', href: 'tel:134' },
      { label: 'SAG Denuncia online', value: 'sag.gob.cl', href: 'https://www.sag.gob.cl' },
    ],
  },
  {
    icon: TreePine,
    color: 'text-emerald-600',
    title: 'Encontré tala ilegal de bosque',
    urgency: 'media',
    steps: [
      { text: 'Documenta la ubicación exacta (coordenadas GPS si puedes).' },
      { text: 'Fotografía los árboles talados, maquinaria o personas involucradas.' },
      { text: 'Reporta a CONAF (guardaparques o central) y a la SMA si involucra área protegida.' },
      { text: 'Guarda tu denuncia — puede ser clave en procesos sancionatorios.' },
    ],
    contacts: [
      { label: 'CONAF', value: '130', href: 'tel:130' },
      { label: 'SMA Denuncia', value: 'sma.gob.cl', href: 'https://www.sma.gob.cl/index.php/sma/denuncias' },
    ],
  },
  {
    icon: Droplets,
    color: 'text-blue-500',
    title: 'Vi contaminación de río o lago',
    urgency: 'media',
    steps: [
      { text: 'No toques el agua contaminada — puede contener agentes tóxicos.' },
      { text: 'Documenta el lugar, hora, tipo de vertimiento y posible fuente.' },
      { text: 'Reporta a la SMA o SERNAPESCA con fotos y coordenadas.' },
      { text: 'Si hay peces muertos, también avisa a SERNAPESCA por posible sanción pesquera.' },
    ],
    contacts: [
      { label: 'SMA', value: '600 888 7622', href: 'tel:6008887622' },
      { label: 'SERNAPESCA', value: '800 320 032', href: 'tel:800320032' },
      { label: 'SMA Denuncia', value: 'sma.gob.cl', href: 'https://www.sma.gob.cl/index.php/sma/denuncias' },
    ],
  },
  {
    icon: MapPin,
    color: 'text-violet-500',
    title: 'Quiero adoptar un territorio',
    urgency: 'baja',
    steps: [
      { text: 'Revisa los programas de voluntariado de CONAF para parques nacionales.' },
      { text: 'Contacta organizaciones como Rewilding Chile o Fundación Bosque Nativo para iniciativas de restauración.' },
      { text: 'Considera el programa de Custodios de la Naturaleza del MMA.' },
      { text: 'Únetete a grupos locales de limpieza y monitoreo de humedales o playas.' },
    ],
    contacts: [
      { label: 'Voluntariado CONAF', value: 'conaf.cl', href: 'https://www.conaf.cl' },
      { label: 'Rewilding Chile', value: 'rewildingchile.org', href: 'https://rewildingchile.org' },
    ],
  },
  {
    icon: FlaskConical,
    color: 'text-teal-600',
    title: 'Quiero hacer ciencia ciudadana',
    urgency: 'baja',
    steps: [
      { text: 'Descarga iNaturalist y empieza a registrar especies en tu entorno cotidiano.' },
      { text: 'Para aves, usa eBird (Cornell Lab) — muy valorado por científicos chilenos.' },
      { text: 'Participa en los "bioblitz" organizados por el Museo de Historia Natural.' },
      { text: 'Tus registros alimentan bases de datos científicas globales como GBIF.' },
    ],
    contacts: [
      { label: 'iNaturalist Chile', value: 'inaturalist.org', href: 'https://www.inaturalist.org/observations?place_id=7259' },
      { label: 'eBird Chile', value: 'ebird.org', href: 'https://ebird.org/region/CL' },
      { label: 'GBIF', value: 'gbif.org', href: 'https://www.gbif.org' },
    ],
  },
]

export function ActionGuides() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500 mb-5">
        ¿No sabes qué hacer ante una situación de emergencia ambiental? Aquí están los
        pasos concretos y los contactos correctos para actuar de forma efectiva.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide) => {
          const Icon = guide.icon
          return (
            <div
              key={guide.title}
              className={`rounded-2xl border p-5 ${URGENCY_STYLES[guide.urgency]}`}
            >
              {/* Cabecera */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className={`h-5 w-5 ${guide.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-stone-900 text-sm">{guide.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${URGENCY_BADGE[guide.urgency]}`}>
                      {URGENCY_LABELS[guide.urgency]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pasos */}
              <ol className="space-y-1.5 mb-4">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-600">
                    <span className="flex-shrink-0 font-semibold text-stone-400 w-4">{i + 1}.</span>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>

              {/* Contactos */}
              <div className="flex flex-wrap gap-2">
                {guide.contacts.map((contact) => (
                  <a
                    key={contact.label}
                    href={contact.href ?? '#'}
                    target={contact.href?.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium bg-white border border-stone-200 text-stone-700 hover:border-teal-300 hover:text-teal-700 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    {contact.label}: {contact.value}
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
