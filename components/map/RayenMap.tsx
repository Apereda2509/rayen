'use client'

import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import Map, {
  Source, Layer, NavigationControl,
  Popup, MapRef,
} from 'react-map-gl'
import type { LayerProps, MapLayerMouseEvent, MapMouseEvent } from 'react-map-gl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { ConservationBadge } from '@/components/species/ConservationBadge'
import { UICN_LABELS } from '@/lib/types'
import type { UICNStatus } from '@/lib/types'

// ── Vista inicial centrada en Chile ──────────────────────────
const INITIAL_VIEW = {
  longitude: -71.5,
  latitude: -38.5,
  zoom: 4,
  pitch: 0,
  bearing: 0,
}

// ── Colores por estado UICN ───────────────────────────────────
const UICN_COLOR_EXPRESSION: any = [
  'match', ['get', 'uicnStatus'],
  'CR', '#D85A30',
  'EN', '#D85A30',
  'VU', '#F59E0B',
  'NT', '#78716C',
  'LC', '#00E676',
  'DD', '#888780',
  '#5F5E5A',
]

// ── SNASPE tipo labels ────────────────────────────────────────
const SNASPE_TIPO_LABELS: Record<string, string> = {
  Parques:    'Parque Nacional',
  Reservas:   'Reserva Nacional',
  Monumentos: 'Monumento Natural',
}

interface SightingFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    id: string
    speciesId: string
    slug: string
    commonName: string
    scientificName: string
    uicnStatus: UICNStatus | null
    photoUrl: string | null
    observedAt: string | null
    observerName: string | null
  }
}

interface PopupSpecies {
  slug: string
  commonName: string
  scientificName: string
  uicnStatus: UICNStatus | null
  photoUrl: string | null
  regionCodes: string[]
  observedAt: string | null
  observerName: string | null
}

interface TooltipInfo {
  x: number
  y: number
  commonName: string
  photoUrl: string | null
  uicnStatus: UICNStatus | null
}

interface SnaspeHoverInfo {
  x: number
  y: number
  nombre: string
  tipo: string | null
  superficie_ha: number | null
  region: string | null
}

interface AreaPopupInfo {
  longitude: number
  latitude: number
  name: string
  type: string
  regionName: string | null
  areaHa: number | null
  slug: string
}

interface Props {
  sightings: SightingFeature[]
  showProtectedAreas?: boolean
  selectedAreaSlugs?: string[]
  onMarkerClick?: (speciesId: string) => void
  selectedSlug?: string | null
}

export function RayenMap({ sightings, showProtectedAreas = false, selectedAreaSlugs = [], onMarkerClick, selectedSlug }: Props) {
  const router = useRouter()
  const mapRef = useRef<MapRef>(null)
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number
    latitude: number
    species: PopupSpecies
  } | null>(null)
  const [areaPopup, setAreaPopup] = useState<AreaPopupInfo | null>(null)
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)
  const [snaspeHover, setSnaspeHover] = useState<SnaspeHoverInfo | null>(null)
  const [areasGeojson, setAreasGeojson] = useState<any>(null)
  const [snaspeGeojson, setSnaspeGeojson] = useState<any>(null)
  const [locating, setLocating] = useState(false)

  // ── Carga áreas protegidas (puntos) ──────────────────────
  useEffect(() => {
    if (!showProtectedAreas) { setAreasGeojson(null); return }
    fetch('/api/protected-areas')
      .then(r => r.json())
      .then(setAreasGeojson)
      .catch(() => setAreasGeojson(null))
  }, [showProtectedAreas])

  // ── Carga polígonos SNASPE al montar ─────────────────────
  useEffect(() => {
    fetch('/api/snaspe')
      .then(r => r.json())
      .then(data => {
        console.log('[SNASPE] features:', data.features?.length)
        if (data?.features?.length) setSnaspeGeojson(data)
      })
      .catch((err) => {
        console.error('[SNASPE] fetch error:', err)
        setSnaspeGeojson(null)
      })
  }, [])

  // ── FlyTo cuando cambia especie seleccionada ─────────────
  useEffect(() => {
    if (!selectedSlug) return
    const map = mapRef.current
    if (!map) return
    const slugSightings = sightings.filter((s) => s.properties.slug === selectedSlug)
    if (!slugSightings.length) return
    const lngs = slugSightings.map((s) => s.geometry.coordinates[0])
    const lats = slugSightings.map((s) => s.geometry.coordinates[1])
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
    map.flyTo({
      center: [centerLng, centerLat],
      zoom: slugSightings.length === 1 ? 11 : 8,
      duration: 1200,
    })
  }, [selectedSlug, sightings])

  const filteredAreasGeojson = useMemo(() => {
    if (!areasGeojson) return null
    if (!selectedAreaSlugs.length) return areasGeojson
    return {
      ...areasGeojson,
      features: areasGeojson.features.filter((f: any) =>
        selectedAreaSlugs.includes(f.properties.slug)
      ),
    }
  }, [areasGeojson, selectedAreaSlugs])

  useEffect(() => {
    if (!selectedAreaSlugs.length || !areasGeojson || !mapRef.current) return
    const selected = areasGeojson.features.filter((f: any) =>
      selectedAreaSlugs.includes(f.properties.slug)
    )
    if (!selected.length) return
    const lngs: number[] = selected.map((f: any) => f.geometry.coordinates[0])
    const lats: number[] = selected.map((f: any) => f.geometry.coordinates[1])
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
    mapRef.current.flyTo({
      center: [centerLng, centerLat],
      zoom: selected.length === 1 ? 9 : 6,
      duration: 1200,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreaSlugs.join(','), areasGeojson])

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: sightings,
  }), [sightings])

  // ── Layer definitions ─────────────────────────────────────

  const snaspeFillLayer: LayerProps = {
    id: 'snaspe-fill',
    type: 'fill',
    source: 'snaspe',
    paint: {
      'fill-color': '#00E676',
      'fill-opacity': [
        'match', ['get', 'tipo'],
        'Parques',    0.15,
        'Reservas',   0.10,
        'Monumentos', 0.12,
        0.08,
      ] as any,
    },
  }

  const snaspeLineLayer: LayerProps = {
    id: 'snaspe-line',
    type: 'line',
    source: 'snaspe',
    paint: {
      'line-color': '#00E676',
      'line-width': 1.5,
      'line-opacity': 0.6,
    },
  }

  const clusterLayer: LayerProps = {
    id: 'clusters',
    type: 'circle',
    source: 'sightings',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#0A0A0A',
      'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 30],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.92,
    },
  }

  const clusterCountLayer: LayerProps = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'sightings',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
      'text-size': 13,
    },
    paint: { 'text-color': '#ffffff' },
  }

  const pointLayer: LayerProps = {
    id: 'unclustered-point',
    type: 'circle',
    source: 'sightings',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': UICN_COLOR_EXPRESSION,
      'circle-radius': 7,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  }

  const areaCircleLayer: LayerProps = {
    id: 'areas-circle',
    type: 'circle',
    source: 'protected-areas',
    paint: {
      'circle-color': '#22c55e',
      'circle-opacity': 0.25,
      'circle-stroke-color': '#16a34a',
      'circle-stroke-width': 2,
      'circle-stroke-opacity': 0.7,
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 12, 8, 30, 12, 60],
    },
  }

  const areaLabelLayer: LayerProps = {
    id: 'areas-label',
    type: 'symbol',
    source: 'protected-areas',
    minzoom: 6,
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
      'text-size': 11,
      'text-anchor': 'top',
      'text-offset': [0, 1.2],
      'text-max-width': 10,
    },
    paint: {
      'text-color': '#166534',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1.5,
    },
  }

  // ── Click handler ─────────────────────────────────────────
  const onClick = useCallback(async (e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap()
    if (!map) return

    // Prioridad 1: área protegida (puntos existentes)
    const areaHits = map.queryRenderedFeatures(e.point, { layers: ['areas-circle'] })
    if (areaHits.length > 0) {
      const props = areaHits[0].properties
      setPopupInfo(null)
      setAreaPopup({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        name: props?.name ?? '',
        type: props?.type ?? '',
        regionName: props?.regionName ?? null,
        areaHa: props?.areaHa ?? null,
        slug: props?.slug ?? '',
      })
      return
    }

    // Prioridad 2: polígono SNASPE
    const snaspeHits = map.queryRenderedFeatures(e.point, { layers: ['snaspe-fill'] })
    if (snaspeHits.length > 0) {
      const props = snaspeHits[0].properties
      if (props?.rayen_slug) {
        router.push(`/areas-protegidas/${props.rayen_slug}`)
      } else {
        // Sin slug: mostrar popup informativo
        setPopupInfo(null)
        setAreaPopup({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
          name: props?.nombre ?? '',
          type: props?.tipo ?? '',
          regionName: props?.region ?? null,
          areaHa: props?.superficie_ha ?? null,
          slug: '',
        })
      }
      return
    }

    // Prioridad 3: cluster → zoom
    const clusterHits = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    if (clusterHits.length > 0) {
      map.easeTo({ center: [e.lngLat.lng, e.lngLat.lat], zoom: Math.min(map.getZoom() + 2, 16), duration: 500 })
      return
    }

    // Prioridad 4: punto de avistamiento
    const features = e.features
    if (!features?.length) { setPopupInfo(null); setAreaPopup(null); return }

    const feature = features[0]
    const props = feature.properties
    if (!props?.slug) return

    const coords = (feature.geometry as any)?.coordinates
    if (!Array.isArray(coords) || coords.length < 2) return
    const lng = Number(coords[0])
    const lat = Number(coords[1])
    if (isNaN(lng) || isNaN(lat)) return

    try {
      const res = await fetch(`/api/species/${props.slug}`)
      if (!res.ok) return
      const { data } = await res.json()
      if (!data) return

      const primaryMedia = data.media?.find((m: any) => m.is_primary || m.isPrimary) ?? data.media?.[0]

      setPopupInfo({
        longitude: lng,
        latitude: lat,
        species: {
          slug: data.slug,
          commonName: data.common_name ?? data.commonName ?? '',
          scientificName: data.scientific_name ?? data.scientificName ?? '',
          uicnStatus: data.uicn_status ?? data.uicnStatus ?? null,
          photoUrl: primaryMedia?.url ?? props.photoUrl ?? null,
          regionCodes: data.regionCodes ?? [],
          observedAt: props.observedAt ?? null,
          observerName: props.observerName ?? null,
        },
      })
      onMarkerClick?.(data.id)
    } catch (err) {
      console.error('Error cargando especie:', err)
    }
  }, [onMarkerClick, router])

  // ── Hover ─────────────────────────────────────────────────
  const onMouseMove = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current?.getMap()
    if (!map) return

    // Puntos de avistamiento (máxima prioridad)
    const hits = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
    if (hits.length > 0) {
      const props = hits[0].properties
      map.getCanvas().style.cursor = 'pointer'
      setTooltip({ x: e.point.x, y: e.point.y, commonName: props?.commonName ?? '', photoUrl: props?.photoUrl ?? null, uicnStatus: props?.uicnStatus ?? null })
      setSnaspeHover(null)
      return
    }

    // Áreas protegidas (puntos)
    const areaHits = map.queryRenderedFeatures(e.point, { layers: ['areas-circle'] })
    if (areaHits.length > 0) {
      const props = areaHits[0].properties
      map.getCanvas().style.cursor = 'pointer'
      setTooltip({ x: e.point.x, y: e.point.y, commonName: props?.name ?? '', photoUrl: null, uicnStatus: null })
      setSnaspeHover(null)
      return
    }

    // Polígonos SNASPE
    const snaspeHits = map.queryRenderedFeatures(e.point, { layers: ['snaspe-fill'] })
    if (snaspeHits.length > 0) {
      const props = snaspeHits[0].properties
      map.getCanvas().style.cursor = 'pointer'
      setTooltip(null)
      setSnaspeHover({
        x: e.point.x,
        y: e.point.y,
        nombre: props?.nombre ?? '',
        tipo: props?.tipo ?? null,
        superficie_ha: props?.superficie_ha ?? null,
        region: props?.region ?? null,
      })
      return
    }

    const clusterHits = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    map.getCanvas().style.cursor = clusterHits.length > 0 ? 'pointer' : ''
    setTooltip(null)
    setSnaspeHover(null)
  }, [])

  const onMouseLeave = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = ''
    setTooltip(null)
    setSnaspeHover(null)
  }, [])

  // ── Geolocalización ───────────────────────────────────────
  function handleLocate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 11,
          duration: 1200,
        })
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['clusters', 'unclustered-point', 'areas-circle', 'snaspe-fill']}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        maxBounds={[[-110, -57], [-50, -17]]}
        minZoom={3}
        maxZoom={16}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* Polígonos SNASPE — debajo de todo lo demás */}
        {snaspeGeojson && (
          <Source id="snaspe" type="geojson" data={snaspeGeojson}>
            <Layer {...snaspeFillLayer} />
            <Layer {...snaspeLineLayer} />
          </Source>
        )}

        {showProtectedAreas && filteredAreasGeojson && (
          <Source id="protected-areas" type="geojson" data={filteredAreasGeojson}>
            <Layer {...areaCircleLayer} />
            <Layer {...areaLabelLayer} />
          </Source>
        )}

        <Source
          id="sightings"
          type="geojson"
          data={geojson}
          cluster
          clusterMaxZoom={12}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...pointLayer} />
        </Source>

        {areaPopup && (
          <Popup
            longitude={areaPopup.longitude}
            latitude={areaPopup.latitude}
            anchor="bottom"
            offset={12}
            closeOnClick={false}
            onClose={() => setAreaPopup(null)}
            maxWidth="280px"
          >
            <AreaPopupCard area={areaPopup} />
          </Popup>
        )}

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            offset={12}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            maxWidth="300px"
          >
            <SpeciesPopup species={popupInfo.species} />
          </Popup>
        )}
      </Map>

      {/* Botón centrar en mi ubicación */}
      <button
        onClick={handleLocate}
        disabled={locating}
        className="absolute top-16 right-2.5 z-10 flex items-center gap-1.5 bg-zinc-900 rounded-lg shadow-md border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-60 transition-colors"
        title="Centrar en mi ubicación"
      >
        <MapPin className={`h-3.5 w-3.5 ${locating ? 'animate-pulse text-[#00E676]' : ''}`} />
        {locating ? 'Localizando…' : 'Mi ubicación'}
      </button>

      {tooltip && <HoverTooltip tooltip={tooltip} />}
      {snaspeHover && <SnaspeTooltip info={snaspeHover} />}
    </div>
  )
}

// ── Tooltip hover — avistamientos ─────────────────────────────
const UICN_COLORS: Record<string, string> = {
  CR: '#D85A30', EN: '#D85A30', VU: '#F59E0B',
  NT: '#78716C', LC: '#00E676', DD: '#888780',
}

function HoverTooltip({ tooltip }: { tooltip: TooltipInfo }) {
  const { x, y, commonName, photoUrl, uicnStatus } = tooltip
  return (
    <div
      className="pointer-events-none absolute z-20 flex items-center gap-2 rounded-lg bg-white/95 shadow-lg border border-stone-200 px-2.5 py-1.5 text-sm"
      style={{ left: x + 14, top: y - 40, transform: 'translateY(-50%)' }}
    >
      {photoUrl && (
        <img src={photoUrl} alt={commonName} className="h-8 w-8 rounded-md object-cover flex-shrink-0" referrerPolicy="no-referrer" />
      )}
      <span className="font-medium text-stone-800 whitespace-nowrap max-w-[160px] truncate">
        {commonName}
      </span>
      {uicnStatus && (
        <span
          className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: UICN_COLORS[uicnStatus] ?? '#888' }}
        >
          {UICN_LABELS[uicnStatus as keyof typeof UICN_LABELS] ?? uicnStatus}
        </span>
      )}
    </div>
  )
}

// ── Tooltip hover — polígonos SNASPE ─────────────────────────
function SnaspeTooltip({ info }: { info: SnaspeHoverInfo }) {
  const { x, y, nombre, tipo, superficie_ha, region } = info
  const tipoLabel = tipo ? (SNASPE_TIPO_LABELS[tipo] ?? tipo) : null
  // Strip "[Tipo]" suffix from nombre for display
  const displayName = nombre.replace(/\s*\[.*?\]\s*$/, '').trim()
  return (
    <div
      className="pointer-events-none absolute z-20 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-xl px-3 py-2.5 min-w-[180px] max-w-[240px]"
      style={{ left: x + 14, top: y - 60, transform: 'translateY(-50%)' }}
    >
      <p className="font-grotesk font-semibold text-white text-sm leading-tight truncate">
        {displayName}
      </p>
      {tipoLabel && (
        <p className="text-[#00E676] text-xs mt-0.5">{tipoLabel}</p>
      )}
      {region && (
        <p className="text-zinc-400 text-xs mt-1 capitalize lowercase">
          {region.charAt(0).toUpperCase() + region.slice(1).toLowerCase()}
        </p>
      )}
      {superficie_ha != null && (
        <p className="text-zinc-500 text-xs mt-0.5">
          {Number(superficie_ha).toLocaleString('es-CL')} ha
        </p>
      )}
    </div>
  )
}

// ── Popup de especie al hacer click ───────────────────────────
function SpeciesPopup({ species }: { species: PopupSpecies }) {
  const { slug, commonName, scientificName, uicnStatus, photoUrl, observedAt, observerName } = species
  const statusHex = uicnStatus ? (UICN_COLORS[uicnStatus] ?? '#666') : null

  return (
    <div className="w-[280px] p-3">
      <div className="flex gap-3">
        {photoUrl && (
          <img src={photoUrl} alt={commonName} referrerPolicy="no-referrer" className="h-[60px] w-[60px] rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-grotesk font-semibold text-white text-sm leading-tight truncate">{commonName}</h3>
          <p className="font-serif italic text-zinc-400 text-xs mt-0.5 truncate">{scientificName}</p>
          {statusHex && uicnStatus && (
            <span className="inline-block mt-1.5 text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${statusHex}22`, color: statusHex }}>
              {uicnStatus}
            </span>
          )}
        </div>
      </div>
      {(observedAt || observerName) && (
        <div className="mt-2.5 pt-2.5 border-t border-zinc-800 space-y-0.5">
          {observedAt && (
            <p className="text-zinc-500 text-xs">
              {new Date(observedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          {observerName && <p className="text-zinc-500 text-xs">por {observerName}</p>}
        </div>
      )}
      <Link href={`/especies/${slug}`} className="mt-3 inline-flex items-center gap-1 text-[#00E676] text-xs hover:underline">
        Ver ficha →
      </Link>
    </div>
  )
}

// ── Popup de área protegida ────────────────────────────────────
const AREA_TYPE_LABELS: Record<string, string> = {
  parque_nacional:      'Parque Nacional',
  reserva_nacional:     'Reserva Nacional',
  monumento_natural:    'Monumento Natural',
  santuario_naturaleza: 'Santuario de la Naturaleza',
  area_marina:          'Área Marina Protegida',
  sitio_ramsar:         'Sitio Ramsar',
  Parques:              'Parque Nacional',
  Reservas:             'Reserva Nacional',
  Monumentos:           'Monumento Natural',
}

function AreaPopupCard({ area }: { area: AreaPopupInfo }) {
  return (
    <div className="w-[260px] p-3">
      <div className="flex items-start gap-2 mb-2">
        <div>
          <h3 className="font-grotesk font-semibold text-white text-sm leading-tight">
            {area.name.replace(/\s*\[.*?\]\s*$/, '').trim()}
          </h3>
          <p className="text-[11px] text-[#00E676] font-medium mt-0.5">
            {AREA_TYPE_LABELS[area.type] ?? area.type}
          </p>
        </div>
      </div>
      {area.regionName && (
        <p className="text-xs text-zinc-400 mb-1">
          {area.regionName.charAt(0).toUpperCase() + area.regionName.slice(1).toLowerCase()}
        </p>
      )}
      {area.areaHa && (
        <p className="text-xs text-zinc-500 mb-3">
          {Number(area.areaHa).toLocaleString('es-CL')} ha
        </p>
      )}
      {area.slug && (
        <Link
          href={`/areas-protegidas/${area.slug}`}
          className="flex items-center justify-center gap-1 w-full rounded-lg bg-[#00E676] hover:bg-[#52F599] px-3 py-2 text-xs font-medium text-black transition-colors"
        >
          Ver área completa →
        </Link>
      )}
    </div>
  )
}
