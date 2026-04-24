import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import nextDynamic from 'next/dynamic'
import { getSpeciesBySlug } from '@/lib/db'
import { ConservationBadge } from '@/components/species/ConservationBadge'
import { SpeciesSightingsSection } from '@/components/species/SpeciesSightingsSection'
import {
  UICN_LABELS, SPECIES_TYPE_LABELS,
  type Species,
} from '@/lib/types'
import { Eye } from 'lucide-react'

const SpeciesMap = nextDynamic(
  () => import('@/components/species/SpeciesMap').then(m => m.SpeciesMap),
  { ssr: false }
)

export const revalidate = 600

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const species = await getSpeciesBySlug(params.slug)
  if (!species) return {}
  const uicnLabel = species.uicnStatus ? (UICN_LABELS[species.uicnStatus] ?? species.uicnStatus) : 'No evaluado'
  const description = `${species.commonName} (${species.scientificName}) — Estado UICN: ${uicnLabel}. ${species.description?.slice(0, 120) ?? ''}`
  const primaryPhoto = species.media?.find((m) => m.isPrimary) ?? species.media?.[0]
  return {
    title: species.commonName,
    description: description.slice(0, 160),
    openGraph: primaryPhoto?.url ? {
      images: [{ url: primaryPhoto.url, width: 1200, height: 630 }],
    } : undefined,
  }
}

export default async function EspeciePage({ params }: Props) {
  const species = await getSpeciesBySlug(params.slug)
  if (!species) notFound()

  const primaryPhoto = species.media?.find((m) => m.isPrimary) ?? species.media?.[0]
  const photoUrl = primaryPhoto?.url?.includes('wikimedia.org')
    ? `/api/img?url=${encodeURIComponent(primaryPhoto.url)}`
    : primaryPhoto?.url

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-stone-400">
        <Link href="/especies" className="hover:text-neon-600 transition-colors">Especies</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-600">{species.commonName}</span>
      </nav>

      {/* Cabecera */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        {/* Foto principal */}
        <div className="relative w-full md:w-72 h-60 flex-shrink-0 rounded-2xl overflow-hidden bg-stone-100">
          {photoUrl ? (
            <>
              <Image
                src={photoUrl}
                alt={species.commonName}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 288px"
                className="object-cover"
              />
              <span className="absolute bottom-1 right-2 text-[10px] text-white/70">
                © {primaryPhoto?.credit}
              </span>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-300">
              {SPECIES_TYPE_LABELS[species.type]}
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
              {SPECIES_TYPE_LABELS[species.type]}
            </span>
            {species.isEndemic && (
              <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                Endémica de Chile
              </span>
            )}
            {species.isNationalSymbol && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">
                Símbolo nacional
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-stone-900 leading-tight">{species.commonName}</h1>
          <p className="text-lg italic text-stone-400 mt-0.5">{species.scientificName}</p>

          {species.indigenousNames?.length ? (
            <p className="mt-2 text-sm text-stone-500">
              {species.indigenousNames.map((n) =>
                `"${n.name}" en ${n.language}${n.meaning ? ` (${n.meaning})` : ''}`
              ).join(' · ')}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 mt-4">
            {species.uicnStatus && (
              <ConservationBadge status={species.uicnStatus} size="lg" />
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {species.estimatedPopulation && (
              <Stat label="Población estimada" value={species.estimatedPopulation} />
            )}
            {species.populationTrend && species.populationTrend !== 'desconocida' && (
              <Stat label="Tendencia" value={trendLabel(species.populationTrend)} />
            )}
            {species.citesAppendix && (
              <Stat label="CITES" value={`Apéndice ${species.citesAppendix}`} />
            )}
            {species.chileDecree && (
              <Stat label="Decreto DS" value={species.chileDecree} />
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <Section title="Descripción">
        <p className="text-stone-600 leading-relaxed">{species.description}</p>
      </Section>

      {/* Rol en el ecosistema */}
      {species.ecosystemRole && (
        <Section title="Rol en el ecosistema">
          <p className="text-stone-600 leading-relaxed">{species.ecosystemRole}</p>
        </Section>
      )}

      {/* Impacto en tu vida cotidiana */}
      {species.humanImpactDaily && (
        <Section title="¿Por qué importa en tu vida diaria?">
          <p className="text-stone-600 leading-relaxed">{species.humanImpactDaily}</p>
        </Section>
      )}

      {/* Datos biológicos */}
      <Section title="Ficha biológica">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {species.typeDiet && (
            <Stat label="Dieta" value={dietLabel(species.typeDiet)} />
          )}
          {species.activePeriod && (
            <Stat label="Actividad" value={periodLabel(species.activePeriod)} />
          )}
          {species.lifespanYears && (
            <Stat label="Longevidad" value={`~${species.lifespanYears} años`} />
          )}
          {species.altitudeMin != null && species.altitudeMax != null && (
            <Stat label="Altitud" value={`${species.altitudeMin}–${species.altitudeMax} m s.n.m.`} />
          )}
          {species.sizeData?.weightKg && (
            <Stat
              label="Peso"
              value={
                typeof species.sizeData.weightKg === 'object'
                  ? `${species.sizeData.weightKg.min}–${species.sizeData.weightKg.max} kg`
                  : `${species.sizeData.weightKg} kg`
              }
            />
          )}
          {species.dangerLevel && species.dangerLevel !== 'ninguno' && (
            <Stat label="Peligrosidad" value={dangerLabel(species.dangerLevel)} />
          )}
        </div>
      </Section>

      {/* Taxonomía */}
      <Section title="Clasificación taxonómica">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {Object.entries(species.taxonomy).map(([key, val]) => (
            <Stat key={key} label={taxLabel(key)} value={val as string} />
          ))}
        </div>
      </Section>

      {/* Distribución */}
      {((species.regionCodes?.length ?? 0) > 0 || (species.ecosystemSlugs?.length ?? 0) > 0 || (species.countries?.length ?? 0) > 0) && (
        <Section title="Distribución">
          {species.countries?.length ? (
            <p className="text-sm text-stone-600 mb-3">
              <span className="font-medium">Países:</span> {species.countries.join(', ')}
            </p>
          ) : null}
          {species.ecosystemSlugs?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Ecosistemas</p>
              <div className="flex flex-wrap gap-2">
                {species.ecosystemSlugs.map((slug) => (
                  <span key={slug} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-lg">
                    {ECOSYSTEM_NAMES[slug] ?? slug}
                  </span>
                ))}
              </div>
            </div>
          )}
          {species.altitudeMin != null && species.altitudeMax != null && (
            <p className="text-sm text-stone-600 mb-4">
              <span className="font-medium">Altitud:</span> {species.altitudeMin}–{species.altitudeMax} m s.n.m.
            </p>
          )}
        </Section>
      )}

      {/* Mapa + avistamientos */}
      <Section title="Distribución y avistamientos verificados">
        <SpeciesMap slug={species.slug} uicnStatus={species.uicnStatus ?? null} />
        <SpeciesSightingsSection
          slug={species.slug}
          regionCodes={species.regionCodes ?? []}
        />
        <div className="mt-5 flex justify-center">
          <Link
            href={`/avistamientos/nuevo?especie=${species.slug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            ¿Viste esta especie? Repórtalo
          </Link>
        </div>
      </Section>

      {/* Amenazas */}
      {(species.threatsLocal?.length || species.threatsGlobal?.length) && (
        <Section title="Amenazas">
          <div className="space-y-3">
            {[...(species.threatsLocal ?? []), ...(species.threatsGlobal ?? [])].map((t, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className={`mt-0.5 flex-shrink-0 h-2.5 w-2.5 rounded-full ${magnitudeColor(t.magnitude)}`} />
                <div>
                  <p className="font-medium text-stone-800 text-sm">{t.name}</p>
                  <p className="text-stone-500 text-sm">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Datos curiosos */}
      {species.funFacts?.length ? (
        <Section title="Datos curiosos">
          <ul className="space-y-3">
            {species.funFacts.map((f, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-neon-400 flex-shrink-0 mt-0.5">✦</span>
                <p className="text-stone-600 text-sm leading-relaxed">{f.text}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Consejos */}
      {(species.visitorTips || species.residentTips) && (
        <Section title="¿Qué puedes hacer?">
          {species.visitorTips && (
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-neon-600 mb-1">Si la visitas</p>
              <p className="text-stone-600 text-sm leading-relaxed">{species.visitorTips}</p>
            </div>
          )}
          {species.residentTips && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neon-600 mb-1">Desde tu ciudad</p>
              <p className="text-stone-600 text-sm leading-relaxed">{species.residentTips}</p>
            </div>
          )}
        </Section>
      )}

      {/* Leyes */}
      {species.laws?.length ? (
        <Section title="Marco legal de protección">
          <ul className="space-y-2">
            {species.laws.map((law) => (
              <li key={law.id} className="text-sm">
                {law.url ? (
                  <a href={law.url} target="_blank" rel="noopener noreferrer"
                    className="text-neon-600 hover:underline font-medium">
                    {law.name} ({law.year})
                  </a>
                ) : (
                  <span className="font-medium text-stone-700">{law.name} ({law.year})</span>
                )}
                {law.description && (
                  <p className="text-stone-500 mt-0.5">{law.description}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Volver */}
      <div className="mt-12 pt-6 border-t border-stone-200">
        <Link href="/especies"
          className="text-sm text-neon-600 hover:text-neon-500 transition-colors">
          ← Volver al catálogo
        </Link>
      </div>
    </main>
  )
}

// ── Componentes pequeños ──────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-stone-800 mb-3 pb-1 border-b border-stone-100">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-400 uppercase tracking-wide">{label}</p>
      <p className="text-stone-700 font-medium text-sm mt-0.5">{value}</p>
    </div>
  )
}

// ── Helpers de etiquetas ──────────────────────────────────────


function trendLabel(t: string) {
  return { aumentando: 'Aumentando', estable: 'Estable', disminuyendo: 'Disminuyendo', desconocida: 'Desconocida' }[t] ?? t
}

function dietLabel(d: string) {
  return { herbivoro: 'Herbívoro', carnivoro: 'Carnívoro', omnivoro: 'Omnívoro',
    'detritívoro': 'Detritívoro', filtrador: 'Filtrador', autotrofo: 'Autótrofo',
    parasito: 'Parásito', otro: 'Otro' }[d] ?? d
}

function periodLabel(p: string) {
  return { diurno: 'Diurno', nocturno: 'Nocturno', crepuscular: 'Crepuscular', variable: 'Variable' }[p] ?? p
}

function dangerLabel(d: string) {
  return { ninguno: 'Ninguno', bajo: 'Bajo', moderado: 'Moderado', alto: 'Alto' }[d] ?? d
}

function taxLabel(key: string) {
  return { kingdom: 'Reino', phylum: 'Filo', class: 'Clase', order: 'Orden',
    family: 'Familia', genus: 'Género', species: 'Especie' }[key] ?? key
}

const REGION_NAMES: Record<string, string> = {
  AP: 'Arica y Parinacota', TA: 'Tarapacá', AN: 'Antofagasta',
  AT: 'Atacama', CO: 'Coquimbo', VA: 'Valparaíso', RM: 'Metropolitana',
  LI: "O'Higgins", ML: 'Maule', NB: 'Ñuble', BI: 'Biobío',
  AR: 'La Araucanía', LR: 'Los Ríos', LL: 'Los Lagos',
  AI: 'Aysén', MA: 'Magallanes',
}

const ECOSYSTEM_NAMES: Record<string, string> = {
  desierto_atacama: 'Desierto de Atacama', altiplano: 'Altiplano y Puna',
  matorral_esclerofilo: 'Matorral Esclerófilo', bosque_valdiviano: 'Bosque Valdiviano',
  bosque_andino_patagonico: 'Bosque Andino Patagónico', estepa_patagonica: 'Estepa Patagónica',
  litoral_rocoso: 'Litoral Rocoso', marino: 'Ecosistema Marino',
  canales_patagonicos: 'Canales Patagónicos', andes: 'Cordillera de los Andes',
  humedales: 'Humedales y Bofedales', bosque_araucarias: 'Bosque de Araucarias',
  antartica: 'Antártica e Islas Oceánicas',
}

function magnitudeColor(m: string) {
  return { muy_alta: 'bg-red-500', alta: 'bg-orange-400', media: 'bg-amber-400', baja: 'bg-yellow-300' }[m] ?? 'bg-stone-300'
}
