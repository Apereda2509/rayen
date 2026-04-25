import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import nextDynamic from 'next/dynamic'
import sql from '@/lib/db'
import { getProtectedAreaBySlug, getSightingsNearArea } from '@/lib/db'
import { ConservationBadge } from '@/components/species/ConservationBadge'
import { AreaFotosFeed } from '@/components/comunidad/AreaFotosFeed'
import type { Metadata } from 'next'
import type { UICNStatus } from '@/lib/types'

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const areas = await sql<{ slug: string }[]>`SELECT slug FROM protected_areas`
    return areas.map((a) => ({ slug: a.slug }))
  } catch {
    return []
  }
}

function AreaErrorFallback({ slug, message }: { slug: string; message: string }) {
  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <main className="max-w-5xl mx-auto px-6 py-24">
        <Link href="/areas-protegidas" className="text-zinc-500 hover:text-white text-sm transition-colors">
          ← Áreas Protegidas
        </Link>
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h1 className="text-xl font-semibold text-white mb-2">
            No pudimos cargar esta área protegida
          </h1>
          <p className="text-zinc-500 text-sm mb-6">
            Hubo un problema temporal al conectar con la base de datos. Inténtalo de nuevo en unos segundos.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/areas-protegidas"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors">
              ← Ver todas las áreas
            </Link>
            <Link href={`/areas-protegidas/${slug}`}
              className="rounded-xl bg-[#00E676] hover:bg-emerald-400 px-4 py-2 text-sm font-medium text-black transition-colors">
              Reintentar
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-4 text-xs text-red-500 font-mono">{message}</p>
          )}
        </div>
      </main>
    </div>
  )
}

const AreaMap = nextDynamic(
  () => import('@/components/areas/AreaMap').then(m => m.AreaMap),
  { ssr: false, loading: () => <div className="h-72 rounded-2xl bg-zinc-900 animate-pulse" /> }
)

const TIPO_LABELS: Record<string, string> = {
  parque_nacional: 'Parque Nacional',
  reserva_nacional: 'Reserva Nacional',
  monumento_natural: 'Monumento Natural',
  santuario_naturaleza: 'Santuario de la Naturaleza',
  area_marina: 'Área Marina Protegida',
  sitio_ramsar: 'Sitio Ramsar',
  otro: 'Otra',
}

const TIPO_BADGE_COLORS: Record<string, string> = {
  parque_nacional: 'bg-emerald-900/80 text-emerald-300',
  reserva_nacional: 'bg-blue-900/80 text-blue-300',
  monumento_natural: 'bg-purple-900/80 text-purple-300',
  santuario_naturaleza: 'bg-amber-900/80 text-amber-300',
  area_marina: 'bg-cyan-900/80 text-cyan-300',
  sitio_ramsar: 'bg-teal-900/80 text-teal-300',
  otro: 'bg-zinc-700/80 text-zinc-300',
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const area = await getProtectedAreaBySlug(params.slug)
    if (!area) return { title: 'Área no encontrada' }
    const tipo = TIPO_LABELS[area.type] ?? area.type
    const description = area.description?.slice(0, 160) ?? `${tipo} en ${area.regionName ?? 'Chile'}. Explora su biodiversidad y avistamientos de especies.`
    return {
      title: area.name,
      description,
      openGraph: area.photoUrl ? {
        images: [{ url: area.photoUrl, width: 1200, height: 630 }],
      } : undefined,
    }
  } catch {
    return { title: 'Área Protegida' }
  }
}

export default async function AreaPage({ params }: Props) {
  let area: Awaited<ReturnType<typeof getProtectedAreaBySlug>>
  let sightings: Awaited<ReturnType<typeof getSightingsNearArea>>

  try {
    ;[area, sightings] = await Promise.all([
      getProtectedAreaBySlug(params.slug),
      getSightingsNearArea(params.slug, 12),
    ])
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[area-page] ${params.slug}:`, message)
    return <AreaErrorFallback slug={params.slug} message={message} />
  }

  if (!area) notFound()

  const badgeClass = TIPO_BADGE_COLORS[area.type] ?? 'bg-zinc-700/80 text-zinc-300'

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
              AP
            </span>

            {/* Badge tipo */}
            <span className={`inline-block text-[10px] font-medium rounded-full px-3 py-1.5 ${badgeClass}`}>
              {TIPO_LABELS[area.type] ?? area.type}
            </span>

            {/* Nombre del área */}
            <h1
              className="font-bold text-white leading-tight mt-6"
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: 'clamp(2.5rem, 6vw, 3.75rem)',
              }}
            >
              {area.name}
            </h1>

            {/* Región */}
            {area.regionName && (
              <p
                className="text-zinc-500 text-xl mt-2"
                style={{ fontFamily: 'var(--font-inter), sans-serif', fontStyle: 'italic' }}
              >
                {area.regionName}
              </p>
            )}

            {/* Chips de metadatos */}
            <div className="flex flex-wrap gap-3 mt-6">
              {area.areaHa && (
                <span className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-300">
                  {Number(area.areaHa).toLocaleString('es-CL')} ha
                </span>
              )}
              {(area.sightingsCount ?? 0) > 0 && (
                <span className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-300">
                  {area.sightingsCount} avistamientos
                </span>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-3 mt-6">
              {area.conafUrl && (
                <a
                  href={area.conafUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  Ver en CONAF ↗
                </a>
              )}
              <Link
                href={`/avistamientos/nuevo?area=${area.slug}`}
                className="rounded-xl bg-[#00E676] hover:bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition-colors"
              >
                + Reportar avistamiento
              </Link>
            </div>

            {/* Volver */}
            <Link
              href="/areas-protegidas"
              className="inline-block text-zinc-500 hover:text-white text-sm mt-8 transition-colors"
            >
              ← Volver a Áreas Protegidas
            </Link>
          </div>

          {/* Columna derecha — imagen */}
          <div className="relative">
            {area.photoUrl ? (
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden">
                <Image
                  src={area.photoUrl}
                  alt={area.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl" />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700 text-sm">
                {TIPO_LABELS[area.type] ?? area.type}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Contenido ───────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 py-16">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Tipo', value: TIPO_LABELS[area.type] ?? area.type },
            { label: 'Región', value: area.regionName ?? '—' },
            { label: 'Superficie', value: area.areaHa ? `${Number(area.areaHa).toLocaleString('es-CL')} ha` : '—' },
            { label: 'Avistamientos', value: String(area.sightingsCount ?? 0) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-[11px] text-zinc-600 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-sm font-semibold text-zinc-300">{value}</p>
            </div>
          ))}
        </div>

        {/* Mapa */}
        {area.centroidLat !== null && area.centroidLng !== null && (
          <div className="mb-10">
            <h2
              className="text-2xl font-semibold text-white mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Ubicación
            </h2>
            <div className="rounded-2xl overflow-hidden border border-zinc-800 h-72">
              <AreaMap lat={area.centroidLat} lng={area.centroidLng} name={area.name} />
            </div>
          </div>
        )}

        {/* Descripción */}
        {area.description && (
          <section className="mb-10">
            <h2
              className="text-2xl font-semibold text-white mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Sobre el área
            </h2>
            <p className="text-zinc-300 leading-relaxed">{area.description}</p>
            <div className="mt-8 border-t border-zinc-800" />
          </section>
        )}

        {/* Fotos de la comunidad */}
        <section className="mb-12">
          <h2
            className="text-2xl font-semibold text-white mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Fotos de la comunidad
          </h2>
          <AreaFotosFeed defaultAreaSlug={area.slug} />
          <div className="mt-8 border-t border-zinc-800" />
        </section>

        {/* Avistamientos cercanos */}
        <section>
          <h2
            className="text-2xl font-semibold text-white mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Especies avistadas cerca
            {sightings.length > 0 && (
              <span className="ml-2 text-base font-normal text-zinc-600">(últimos verificados)</span>
            )}
          </h2>

          {sightings.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center">
              <p className="text-zinc-500 text-sm">Aún no hay avistamientos reportados en esta área.</p>
              <Link
                href={`/avistamientos/nuevo?area=${area.slug}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#00E676] hover:bg-emerald-400 px-4 py-2 text-sm font-medium text-black transition-colors"
              >
                ¡Sé el primero en reportar!
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sightings.map((s) => (
                <Link
                  key={s.id}
                  href={`/especies/${s.slug}`}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-700 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="h-28 bg-zinc-800 relative overflow-hidden">
                    {s.photoUrl ? (
                      <Image
                        src={s.photoUrl}
                        alt={s.commonName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600 text-xs">Sin foto</div>
                    )}
                    {s.uicnStatus && (
                      <div className="absolute top-2 left-2">
                        <ConservationBadge
                          status={s.uicnStatus as UICNStatus}
                          photoOverlay
                          showLabel={false}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-zinc-300 truncate">{s.commonName}</p>
                    <p className="text-[10px] italic text-zinc-600 truncate">{s.scientificName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Volver */}
        <div className="mt-12 pt-6 border-t border-zinc-800">
          <Link href="/areas-protegidas" className="text-sm text-zinc-500 hover:text-white transition-colors">
            ← Volver a Áreas Protegidas
          </Link>
        </div>
      </main>
    </div>
  )
}
