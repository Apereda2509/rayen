import { ExternalLink, Scale, Globe, FileText } from 'lucide-react'

const LAW_TYPE_LABELS: Record<string, string> = {
  ley:                    'Ley',
  decreto:                'Decreto',
  convenio_internacional: 'Convenio Internacional',
}

const LAW_TYPE_STYLES: Record<string, string> = {
  ley:                    'bg-blue-950 text-blue-300',
  decreto:                'bg-amber-950 text-amber-300',
  convenio_internacional: 'bg-violet-950 text-violet-300',
}

const LAW_TYPE_ICONS: Record<string, React.ElementType> = {
  ley:                    Scale,
  decreto:                FileText,
  convenio_internacional: Globe,
}

const SIMPLE_EXPLANATIONS: Record<string, string> = {
  '19.473':    'Prohíbe cazar especies protegidas como el huemul, el cóndor y la chinchilla. Establece multas y sanciones penales.',
  '20.283':    'Protege los bosques nativos de Chile. Prohíbe talar sin autorización y exige planes de manejo sustentable.',
  'CBD-1994':  'Tratado internacional que Chile firmó en 1994. Compromete al país a proteger su biodiversidad y compartir sus beneficios de forma justa.',
  'CITES-1975':'Protege especies amenazadas del comercio internacional ilegal. En Chile, resguarda al guanaco, el loro tricahue y otras especies endémicas.',
  'DS-43-1990':'Declara la araucaria Monumento Natural. Cortar o dañar una araucaria está completamente prohibido en Chile.',
  'DS-41-2023':'Lista oficial de especies amenazadas en Chile. Define cuáles están en peligro y establece las prioridades de conservación.',
  '18.362':    'Crea los parques nacionales, reservas y monumentos naturales de Chile. Más de 19 millones de hectáreas protegidas.',
  '21.202':    'Protege los humedales dentro y cerca de ciudades. Impide la construcción o relleno de estos ecosistemas únicos.',
}

interface Law {
  id: string
  name: string
  number: string
  year: number
  type: string
  description: string | null
  url: string | null
}

interface Props {
  laws: Law[]
}

export function LegalSection({ laws }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500 mb-5">
        Chile cuenta con un marco legal robusto para la conservación de la biodiversidad.
        Estas son las principales leyes, decretos y convenios internacionales que protegen
        la fauna y flora silvestre.
      </p>
      {laws.map(law => {
        const Icon = LAW_TYPE_ICONS[law.type] ?? FileText
        const simpleExplanation = SIMPLE_EXPLANATIONS[law.number] ?? null

        return (
          <div
            key={law.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-grotesk font-semibold text-white text-sm">{law.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${LAW_TYPE_STYLES[law.type] ?? 'bg-zinc-800 text-zinc-400'}`}>
                    {LAW_TYPE_LABELS[law.type] ?? law.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono text-zinc-500">{law.number}</span>
                  <span className="text-xs text-zinc-700">·</span>
                  <span className="text-xs text-zinc-500">{law.year}</span>
                </div>

                {simpleExplanation && (
                  <div className="mb-3">
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">
                      Qué significa para ti
                    </p>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {simpleExplanation}
                    </p>
                  </div>
                )}

                {law.url && (
                  <a
                    href={law.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Documento oficial →
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
