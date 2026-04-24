import { ExternalLink, Scale, Globe, FileText } from 'lucide-react'

const LAW_TYPE_LABELS: Record<string, string> = {
  ley:                    'Ley',
  decreto:                'Decreto',
  convenio_internacional: 'Convenio Internacional',
}

const LAW_TYPE_STYLES: Record<string, string> = {
  ley:                    'bg-blue-50 text-blue-700',
  decreto:                'bg-amber-50 text-amber-700',
  convenio_internacional: 'bg-violet-50 text-violet-700',
}

const LAW_TYPE_ICONS: Record<string, React.ElementType> = {
  ley:                    Scale,
  decreto:                FileText,
  convenio_internacional: Globe,
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
      <p className="text-sm text-stone-500 mb-5">
        Chile cuenta con un marco legal robusto para la conservación de la biodiversidad.
        Estas son las principales leyes, decretos y convenios internacionales que protegen
        la fauna y flora silvestre.
      </p>
      {laws.map(law => {
        const Icon = LAW_TYPE_ICONS[law.type] ?? FileText
        return (
          <div
            key={law.id}
            className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-neon-400/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-stone-900 text-sm">{law.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${LAW_TYPE_STYLES[law.type] ?? 'bg-stone-100 text-stone-600'}`}>
                    {LAW_TYPE_LABELS[law.type] ?? law.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-stone-400">{law.number}</span>
                  <span className="text-xs text-stone-300">·</span>
                  <span className="text-xs text-stone-400">{law.year}</span>
                </div>
                {law.description && (
                  <p className="text-sm text-stone-500 leading-relaxed">{law.description}</p>
                )}
                {law.url && (
                  <a
                    href={law.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-neon-600 hover:text-neon-500 mt-2 font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver texto oficial
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
