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
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* ── Hero editorial ──────────────────────────────────── */}
      <section className="px-6 md:px-16 pt-32 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[60vh]">

          {/* Columna izquierda */}
          <div className="relative">
            {/* Número decorativo */}
            <span
              className="absolute -top-8 -left-4 select-none pointer-events-none leading-none text-[#00E676] font-black"
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: 'clamp(100px, 14vw, 160px)',
                opacity: 0.08,
                lineHeight: 1,
              }}
            >
              01
            </span>

            {/* Badge tipo */}
            <span className="inline-block bg-black/60 border border-zinc-800 text-zinc-300 text-[10px] font-medium rounded-full px-3 py-1.5 backdrop-blur-sm">
              {SPECIES_TYPE_LABELS[species.type]}
            </span>

            {/* Nombre común */}
            <h1
              className="font-bold text-white leading-tight mt-6"
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: 'clamp(2.5rem, 6vw, 3.75rem)',
              }}
            >
              {species.commonName}
            </h1>

            {/* Nombre científico */}
            <p
              className="text-zinc-500 text-xl mt-2"
              style={{ fontFamily: 'var(--font-inter), sans-serif', fontStyle: 'italic' }}
            >
              {species.scientificName}
            </p>

            {/* Nombres indígenas */}
            {species.indigenousNames?.length ? (
              <p className="mt-2 text-sm text-zinc-600">
                {species.indigenousNames.map((n) =>
                  `"${n.name}" en ${n.language}${n.meaning ? ` (${n.meaning})` : ''}`
                ).join(' · ')}
              </p>
            ) : null}

            {/* Chips de metadatos */}
            <div className="flex flex-wrap gap-3 mt-6">
              {species.uicnStatus && (
                <span className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-300">
                  UICN: {UICN_LABELS[species.uicnStatus] ?? species.uicnStatus}
                </span>
              )}
              {species.isEndemic && (
                <span className="bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] rounded-full px-4 py-2 text-sm font-medium">
                  Endémica de Chile
                </span>
              )}
              {species.isNationalSymbol && (
                <span className="bg-amber-900/30 border border-amber-700/40 text-amber-400 rounded-full px-4 py-2 text-sm">
                  Símbolo nacional
                </span>
              )}
              {species.estimatedPopulation && (
                <span className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-300">
                  {species.estimatedPopulation} individuos
                </span>
              )}
            </div>

            {/* Volver */}
            <Link
              href="/especies"
              className="inline-block text-zinc-500 hover:text-white text-sm mt-8 transition-colors"
            >
              ← Volver a Especies
            </Link>
          </div>

          {/* Columna derecha — imagen */}
          <div className="relative">
            {photoUrl ? (
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden">
                <Image
                  src={photoUrl}
                  alt={species.commonName}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl" />
                {primaryPhoto?.credit && (
                  <span className="absolute bottom-2 right-3 text-[10px] text-white/50">
                    © {primaryPhoto.credit}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[4/3] rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700 text-sm">
                {SPECIES_TYPE_LABELS[species.type]}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Contenido ───────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 py-16">

        {/* Descripción */}
        <Section title="Descripción">
          <p className="text-zinc-300 leading-relaxed">{species.description}</p>
        </Section>

        {/* Rol en el ecosistema */}
        {species.ecosystemRole && (
          <Section title="Rol en el ecosistema">
            <p className="text-zinc-300 leading-relaxed">{species.ecosystemRole}</p>
          </Section>
        )}

        {/* Impacto cotidiano */}
        {species.humanImpactDaily && (
          <Section title="¿Por qué importa en tu vida diaria?">
            <p className="text-zinc-300 leading-relaxed">{species.humanImpactDaily}</p>
          </Section>
        )}

        {/* Ficha biológica */}
        <Section title="Ficha biológica">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {species.typeDiet && <Stat label="Dieta" value={dietLabel(species.typeDiet)} />}
              {species.activePeriod && <Stat label="Actividad" value={periodLabel(species.activePeriod)} />}
              {species.lifespanYears && <Stat label="Longevidad" value={`~${species.lifespanYears} años`} />}
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
        </Section>

        {/* Clasificación taxonómica */}
        <Section title="Clasificación taxonómica">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {Object.entries(species.taxonomy).map(([key, val]) => (
                <Stat key={key} label={taxLabel(key)} value={val as string} />
              ))}
            </div>
          </div>
        </Section>

        {/* Distribución */}
        {((species.regionCodes?.length ?? 0) > 0 || (species.ecosystemSlugs?.length ?? 0) > 0 || (species.countries?.length ?? 0) > 0) && (
          <Section title="Distribución">
            {species.countries?.length ? (
              <p className="text-sm text-zinc-400 mb-3">
                <span className="text-zinc-300 font-medium">Países:</span> {species.countries.join(', ')}
              </p>
            ) : null}
            {species.ecosystemSlugs?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-zinc-600 uppercase tracking-wide mb-2">Ecosistemas</p>
                <div className="flex flex-wrap gap-2">
                  {species.ecosystemSlugs.map((slug) => (
                    <span key={slug} className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 rounded-lg">
                      {ECOSYSTEM_NAMES[slug] ?? slug}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {species.altitudeMin != null && species.altitudeMax != null && (
              <p className="text-sm text-zinc-400 mb-4">
                <span className="text-zinc-300 font-medium">Altitud:</span> {species.altitudeMin}–{species.altitudeMax} m s.n.m.
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
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:border-[#00E676]/50 hover:bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors"
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
                    <p className="font-medium text-zinc-200 text-sm">{t.name}</p>
                    <p className="text-zinc-500 text-sm">{t.description}</p>
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
                  <span className="text-[#00E676] flex-shrink-0 mt-0.5">✦</span>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.text}</p>
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
                <p className="text-xs font-semibold uppercase tracking-wide text-[#00E676] mb-1">Si la visitas</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{species.visitorTips}</p>
              </div>
            )}
            {species.residentTips && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#00E676] mb-1">Desde tu ciudad</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{species.residentTips}</p>
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
                      className="text-[#00E676] hover:underline font-medium">
                      {law.name} ({law.year})
                    </a>
                  ) : (
                    <span className="font-medium text-zinc-300">{law.name} ({law.year})</span>
                  )}
                  {law.description && (
                    <p className="text-zinc-500 mt-0.5">{law.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {/* Volver */}
        <div className="mt-12 pt-6 border-t border-zinc-800">
          <Link href="/especies" className="text-sm text-zinc-500 hover:text-white transition-colors">
            ← Volver al catálogo de especies
          </Link>
        </div>
      </main>
    </div>
  )
}

// ── Componentes ───────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="text-2xl font-semibold text-white mb-4"
        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
      >
        {title}
      </h2>
      {children}
      <div className="mt-8 border-t border-zinc-800" />
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-600 uppercase tracking-wide">{label}</p>
      <p className="text-zinc-300 font-medium text-sm mt-0.5">{value}</p>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────

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
  return { muy_alta: 'bg-red-500', alta: 'bg-orange-400', media: 'bg-amber-400', baja: 'bg-yellow-300' }[m] ?? 'bg-zinc-700'
}
