'use client'

import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import Map, {
  Source, Layer, NavigationControl, GeolocateControl,
  Popup, MapRef,
} from 'react-map-gl'
import type { LayerProps, MapLayerMouseEvent, MapMouseEvent } from 'react-map-gl'
import Link from 'next/link'
import { ConservationBadge } from '@/components/species/ConservationBadge'
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
  'EN', '#BA7517',
  'VU', '#EF9F27',
  'NT', '#639922',
  'LC', '#1D9E75',
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
  }
}

interface PopupSpecies {
  slug: string
  commonName: string
  scientificName: string
  uicnStatus: UICNStatus | null
  photoUrl: string | null
  regionCodes: string[]
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
  onMarkerClick?: (speciesId: string) => void
}

export function RayenMap({ sightings, showProtectedAreas = false, onMarkerClick }: Props) {
  const mapRef = useRef<MapRef>(null)
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number
    latitude: number
    species: PopupSpecies
  } | null>(null)
  const [areaPopup, setAreaPopup] = useState<AreaPopupInfo | null>(null)
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)
  const [areasGeojson, setAreasGeojson] = useState<any>(null)

  useEffect(() => {
    if (!showProtectedAreas) { setAreasGeojson(null); return }
    fetch('/api/protected-areas')
      .then(r => r.json())
      .then(setAreasGeojson)
      .catch(() => setAreasGeojson(null))
  }, [showProtectedAreas])

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
      'circle-color': '#085041',
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

  // Layers de áreas protegidas
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

  // ── Click: zoom en cluster o abrir panel de especie ───────
  const onClick = useCallback(async (e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap()
    if (!map) return

    // Click en área protegida
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
        },
      })
      onMarkerClick?.(data.id)
    } catch (err) {
      console.error('Error cargando especie:', err)
    }
  }, [onMarkerClick])

  // ── Hover: tooltip pequeño ────────────────────────────────
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
        <GeolocateControl position="top-right" />

        {/* Capa de áreas protegidas — debajo de sightings */}
        {showProtectedAreas && areasGeojson && (
          <Source id="protected-areas" type="geojson" data={areasGeojson}>
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

        {/* Popup de área protegida */}
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

      {/* Tooltip en hover */}
      {tooltip && (
        <HoverTooltip tooltip={tooltip} />
      )}
    </div>
  )
}

// ── Tooltip hover ─────────────────────────────────────────────
const UICN_COLORS: Record<string, string> = {
  CR: '#D85A30', EN: '#BA7517', VU: '#EF9F27',
  NT: '#639922', LC: '#1D9E75', DD: '#888780',
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
          className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ backgroundColor: UICN_COLORS[uicnStatus] ?? '#888' }}
        >
          {uicnStatus}
        </span>
      )}
    </div>
  )
}

// ── Panel popup al hacer click ────────────────────────────────
const REGION_NAMES: Record<string, string> = {
  AP: 'Arica y Parinacota', TA: 'Tarapacá', AN: 'Antofagasta',
  AT: 'Atacama', CO: 'Coquimbo', VA: 'Valparaíso', RM: 'Metropolitana',
  LI: "O'Higgins", ML: 'Maule', NB: 'Ñuble', BI: 'Biobío',
  AR: 'La Araucanía', LR: 'Los Ríos', LL: 'Los Lagos',
  AI: 'Aysén', MA: 'Magallanes',
}

function SpeciesPopup({ species }: { species: PopupSpecies }) {
  const { slug, commonName, scientificName, uicnStatus, photoUrl, regionCodes } = species
  return (
    <div className="w-[280px] rounded-xl overflow-hidden bg-white">
      {/* Foto */}
      <div className="relative h-36 w-full bg-emerald-50">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={commonName}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-stone-200">🌿</div>
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
        <p className="text-xs text-stone-400 italic mt-0.5">{scientificName}</p>

        {regionCodes?.length > 0 && (
          <p className="text-xs text-stone-500 mt-2">
            {regionCodes.slice(0, 3).map(c => REGION_NAMES[c] ?? c).join(' · ')}
            {regionCodes.length > 3 && ` +${regionCodes.length - 3} más`}
          </p>
        )}

        <Link
          href={`/especies/${slug}`}
          className="mt-3 flex items-center justify-center gap-1 w-full rounded-lg bg-teal-600 hover:bg-teal-500 px-3 py-2 text-xs font-medium text-white transition-colors"
        >
          Ver ficha completa →
        </Link>
      </div>
    </div>
  )
}

// ── Popup de área protegida ────────────────────────────────────

const AREA_TYPE_LABELS: Record<string, string> = {
  parque_nacional: 'Parque Nacional',
  reserva_nacional: 'Reserva Nacional',
  monumento_natural: 'Monumento Natural',
  santuario_naturaleza: 'Santuario de la Naturaleza',
  area_marina: 'Área Marina Protegida',
  sitio_ramsar: 'Sitio Ramsar',
}

function AreaPopupCard({ area }: { area: AreaPopupInfo }) {
  return (
    <div className="w-[260px] p-3 bg-white rounded-xl">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xl">🌿</span>
        <div>
          <h3 className="font-semibold text-stone-900 text-sm leading-tight">{area.name}</h3>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {AREA_TYPE_LABELS[area.type] ?? area.type}
          </p>
        </div>
      </div>
      {area.regionName && (
        <p className="text-xs text-stone-500 mb-1">📍 {area.regionName}</p>
      )}
      {area.areaHa && (
        <p className="text-xs text-stone-500 mb-2">
          📐 {Number(area.areaHa).toLocaleString('es-CL')} ha
        </p>
      )}
      <Link
        href={`/areas-protegidas/${area.slug}`}
        className="flex items-center justify-center gap-1 w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-medium text-white transition-colors"
      >
        Ver área completa →
      </Link>
    </div>
  )
}
