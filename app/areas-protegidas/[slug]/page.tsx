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

// dynamicParams=true (default) — slugs not pre-generated are rendered on demand
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const areas = await sql<{ slug: string }[]>`SELECT slug FROM protected_areas`
    return areas.map((a) => ({ slug: a.slug }))
  } catch {
    // DB pool exhausted at build time — fall back to full on-demand SSR
    return []
  }
}

// Shown when DB/network errors occur so the app doesn't crash completely
function AreaErrorFallback({ slug, message }: { slug: string; message: string }) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <nav className="text-xs text-stone-400 mb-6 flex items-center gap-1.5">
        <Link href="/areas-protegidas" className="hover:text-neon-600 transition-colors">
          Áreas Protegidas
        </Link>
        <span>/</span>
        <span className="text-stone-600">{slug}</span>
      </nav>
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center">
        <h1 className="text-xl font-semibold text-stone-800 mb-2">
          No pudimos cargar esta área protegida
        </h1>
        <p className="text-stone-500 text-sm mb-6">
          Hubo un problema temporal al conectar con la base de datos. Inténtalo de nuevo en unos segundos.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/areas-protegidas"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 transition-colors"
          >
            ← Ver todas las áreas
          </Link>
          <Link
            href={`/areas-protegidas/${slug}`}
            className="rounded-lg bg-neon-400 hover:bg-neon-300 px-4 py-2 text-sm font-medium text-black transition-colors"
          >
            Reintentar
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <p className="mt-4 text-xs text-red-500 font-mono">{message}</p>
        )}
      </div>
    </main>
  )
}

const AreaMap = nextDynamic(
  () => import('@/components/areas/AreaMap').then(m => m.AreaMap),
  { ssr: false, loading: () => <div className="h-72 rounded-xl bg-stone-100 animate-pulse" /> }
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

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400 mb-6 flex items-center gap-1.5">
        <Link href="/areas-protegidas" className="hover:text-neon-600 transition-colors">
          Áreas Protegidas
        </Link>
        <span>/</span>
        <span className="text-stone-600">{area.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neon-600 mb-1">
              {TIPO_LABELS[area.type] ?? area.type}
            </p>
            <h1 className="text-3xl font-bold text-stone-900">{area.name}</h1>
            {area.regionName && (
              <p className="text-stone-500 mt-1">{area.regionName}</p>
            )}
          </div>

          <div className="flex gap-3">
            {area.conafUrl && (
              <a
                href={area.conafUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Ver en CONAF ↗
              </a>
            )}
            <Link
              href={`/avistamientos/nuevo?area=${area.slug}`}
              className="rounded-lg bg-neon-400 hover:bg-neon-300 px-4 py-2 text-sm font-medium text-black transition-colors"
            >
              + Reportar avistamiento aquí
            </Link>
          </div>
        </div>
      </div>

      {/* Foto del área */}
      {area.photoUrl && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-stone-200 relative h-72 sm:h-96">
          <Image
            src={area.photoUrl}
            alt={area.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-cover"
          />
        </div>
      )}

      {/* Mapa centrado en el área */}
      {area.centroidLat !== null && area.centroidLng !== null && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-stone-200 h-72">
          <AreaMap
            lat={area.centroidLat}
            lng={area.centroidLng}
            name={area.name}
          />
        </div>
      )}

      {/* Datos del área */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tipo', value: TIPO_LABELS[area.type] ?? area.type },
          { label: 'Región', value: area.regionName ?? '—' },
          { label: 'Superficie', value: area.areaHa ? `${Number(area.areaHa).toLocaleString('es-CL')} ha` : '—' },
          { label: 'Avistamientos', value: String(area.sightingsCount ?? 0) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-stone-50 border border-stone-200 p-4">
            <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-semibold text-stone-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Descripción */}
      {area.description && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">Sobre el área</h2>
          <p className="text-stone-600 leading-relaxed">{area.description}</p>
        </section>
      )}

      {/* Fotos de la comunidad */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Fotos de la comunidad</h2>
        <AreaFotosFeed defaultAreaSlug={area.slug} />
      </section>

      {/* Avistamientos cercanos */}
      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">
          Especies avistadas cerca
          {sightings.length > 0 && (
            <span className="ml-2 text-sm font-normal text-stone-400">(últimos avistamientos verificados)</span>
          )}
        </h2>

        {sightings.length === 0 ? (
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-8 text-center">
            <p className="text-stone-400 text-sm">Aún no hay avistamientos reportados en esta área.</p>
            <Link
              href={`/avistamientos/nuevo?area=${area.slug}`}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-neon-400 hover:bg-neon-300 px-4 py-2 text-sm font-medium text-black transition-colors"
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
                className="group rounded-xl border border-stone-200 bg-white overflow-hidden hover:shadow-md hover:border-neon-400/40 transition-all"
              >
                <div className="h-28 bg-stone-100 relative overflow-hidden">
                  {s.photoUrl ? (
                    <Image
                      src={s.photoUrl}
                      alt={s.commonName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-200 text-xs">Sin foto</div>
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
                  <p className="text-xs font-medium text-stone-800 truncate">{s.commonName}</p>
                  <p className="text-[10px] italic text-stone-400 truncate">{s.scientificName}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

