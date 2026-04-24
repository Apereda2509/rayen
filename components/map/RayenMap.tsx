'use client'

import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import Map, {
  Source, Layer, NavigationControl,
  Popup, MapRef,
} from 'react-map-gl'
import type { LayerProps, MapLayerMouseEvent, MapMouseEvent } from 'react-map-gl'
import Link from 'next/link'
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
}

export function RayenMap({ sightings, showProtectedAreas = false, selectedAreaSlugs = [], onMarkerClick }: Props) {
  const mapRef = useRef<MapRef>(null)
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number
    latitude: number
    species: PopupSpecies
  } | null>(null)
  const [areaPopup, setAreaPopup] = useState<AreaPopupInfo | null>(null)
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)
  const [areasGeojson, setAreasGeojson] = useState<any>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (!showProtectedAreas) { setAreasGeojson(null); return }
    fetch('/api/protected-areas')
      .then(r => r.json())
      .then(setAreasGeojson)
      .catch(() => setAreasGeojson(null))
  }, [showProtectedAreas])

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

  // ── Layers ────────────────────────────────────────────────
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

  // ── Click handler ────────────────────────────────────────
  const onClick = useCallback(async (e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap()
    if (!map) return

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

    const clusterHits = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    if (clusterHits.length > 0) {
      map.easeTo({ center: [e.lngLat.lng, e.lngLat.lat], zoom: Math.min(map.getZoom() + 2, 16), duration: 500 })
      return
    }

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
  }, [onMarkerClick])

  // ── Hover tooltip ────────────────────────────────────────
  const onMouseMove = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current?.getMap()
    if (!map) return

    const hits = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
    if (hits.length > 0) {
      const props = hits[0].properties
      map.getCanvas().style.cursor = 'pointer'
      setTooltip({
        x: e.point.x,
        y: e.point.y,
        commonName: props?.commonName ?? '',
        photoUrl: props?.photoUrl ?? null,
        uicnStatus: props?.uicnStatus ?? null,
      })
      return
    }

    const areaHits = map.queryRenderedFeatures(e.point, { layers: ['areas-circle'] })
    if (areaHits.length > 0) {
      const props = areaHits[0].properties
      map.getCanvas().style.cursor = 'pointer'
      setTooltip({
        x: e.point.x,
        y: e.point.y,
        commonName: props?.name ?? '',
        photoUrl: null,
        uicnStatus: null,
      })
      return
    }

    const clusterHits = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    map.getCanvas().style.cursor = clusterHits.length > 0 ? 'pointer' : ''
    setTooltip(null)
  }, [])

  const onMouseLeave = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = ''
    setTooltip(null)
  }, [])

  // ── Centrar en mi ubicación ───────────────────────────────
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
        interactiveLayerIds={['clusters', 'unclustered-point', 'areas-circle']}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        maxBounds={[[-110, -57], [-50, -17]]}
        minZoom={3}
        maxZoom={16}
      >
        <NavigationControl position="top-right" showCompass={false} />

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
        className="absolute top-16 right-2.5 z-10 flex items-center gap-1.5 bg-white rounded-lg shadow-md border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60 transition-colors"
        title="Centrar en mi ubicación"
      >
        <MapPin className={`h-3.5 w-3.5 ${locating ? 'animate-pulse text-[#00E676]' : ''}`} />
        {locating ? 'Localizando…' : 'Mi ubicación'}
      </button>

      {tooltip && <HoverTooltip tooltip={tooltip} />}
    </div>
  )
}

// ── Tooltip hover ─────────────────────────────────────────────
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
        <img
          src={photoUrl}
          alt={commonName}
          className="h-8 w-8 rounded-md object-cover flex-shrink-0"
          referrerPolicy="no-referrer"
        />
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

// ── Popup de especie al hacer click ───────────────────────────
const REGION_NAMES: Record<string, string> = {
  AP: 'Arica y Parinacota', TA: 'Tarapacá', AN: 'Antofagasta',
  AT: 'Atacama', CO: 'Coquimbo', VA: 'Valparaíso', RM: 'Metropolitana',
  LI: "O'Higgins", ML: 'Maule', NB: 'Ñuble', BI: 'Biobío',
  AR: 'La Araucanía', LR: 'Los Ríos', LL: 'Los Lagos',
  AI: 'Aysén', MA: 'Magallanes',
}

function SpeciesPopup({ species }: { species: PopupSpecies }) {
  const { slug, commonName, scientificName, uicnStatus, photoUrl, regionCodes, observedAt, observerName } = species
  return (
    <div className="w-[280px] rounded-xl overflow-hidden bg-white">
      {/* Foto */}
      <div className="relative h-36 w-full bg-stone-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={commonName}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-200 text-xs">Sin foto</div>
        )}
        {uicnStatus && (
          <div className="absolute top-2 left-2">
            <ConservationBadge status={uicnStatus} size="sm" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-stone-900 leading-tight">{commonName}</h3>
        <p className="font-serif italic text-xs text-stone-400 mt-0.5">{scientificName}</p>

        {regionCodes?.length > 0 && (
          <p className="text-xs text-stone-500 mt-2">
            {regionCodes.slice(0, 3).map(c => REGION_NAMES[c] ?? c).join(' · ')}
            {regionCodes.length > 3 && ` +${regionCodes.length - 3} más`}
          </p>
        )}

        {/* Datos del avistamiento */}
        {(observedAt || observerName) && (
          <div className="mt-2 pt-2 border-t border-stone-100 space-y-0.5">
            {observedAt && (
              <p className="text-[11px] text-stone-400">
                {new Date(observedAt).toLocaleDateString('es-CL', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            )}
            {observerName && (
              <p className="text-[11px] text-stone-400">
                Por {observerName}
              </p>
            )}
          </div>
        )}

        <Link
          href={`/especies/${slug}`}
          className="mt-3 flex items-center justify-center gap-1 w-full rounded-lg bg-[#00E676] hover:bg-[#52F599] px-3 py-2 text-xs font-medium text-black transition-colors"
        >
          Ver ficha completa →
        </Link>
      </div>
    </div>
  )
}

// ── Popup de área protegida ────────────────────────────────────
const AREA_TYPE_LABELS: Record<string, string> = {
  parque_nacional:     'Parque Nacional',
  reserva_nacional:    'Reserva Nacional',
  monumento_natural:   'Monumento Natural',
  santuario_naturaleza:'Santuario de la Naturaleza',
  area_marina:         'Área Marina Protegida',
  sitio_ramsar:        'Sitio Ramsar',
}

function AreaPopupCard({ area }: { area: AreaPopupInfo }) {
  return (
    <div className="w-[260px] p-3 bg-white rounded-xl">
      <div className="flex items-start gap-2 mb-2">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm leading-tight">{area.name}</h3>
          <p className="text-[11px] text-[#00C760] font-medium mt-0.5">
            {AREA_TYPE_LABELS[area.type] ?? area.type}
          </p>
        </div>
      </div>
      {area.regionName && (
        <p className="text-xs text-stone-500 mb-1">{area.regionName}</p>
      )}
      {area.areaHa && (
        <p className="text-xs text-stone-500 mb-2">
          {Number(area.areaHa).toLocaleString('es-CL')} ha
        </p>
      )}
      <Link
        href={`/areas-protegidas/${area.slug}`}
        className="flex items-center justify-center gap-1 w-full rounded-lg bg-[#00E676] hover:bg-[#52F599] px-3 py-2 text-xs font-medium text-black transition-colors"
      >
        Ver área completa →
      </Link>
    </div>
  )
}
