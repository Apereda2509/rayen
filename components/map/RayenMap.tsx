'use client'

import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import Map, { Source, Layer, NavigationControl, MapRef } from 'react-map-gl'
import type { LayerProps, MapLayerMouseEvent, MapMouseEvent } from 'react-map-gl'
import { MapPin, TreePine, Shield, Star } from 'lucide-react'
import { UICN_LABELS } from '@/lib/types'
import type { UICNStatus } from '@/lib/types'

// ── Initial view ─────────────────────────────────────────────
const INITIAL_VIEW = {
  longitude: -71.5, latitude: -38.5, zoom: 4, pitch: 0, bearing: 0,
}

// ── UICN color expression ────────────────────────────────────
const UICN_COLOR_EXPRESSION: any = [
  'match', ['get', 'uicnStatus'],
  'CR', '#D85A30', 'EN', '#D85A30', 'VU', '#F59E0B',
  'NT', '#78716C', 'LC', '#00E676', 'DD', '#888780',
  '#5F5E5A',
]

const UICN_COLORS: Record<string, string> = {
  CR: '#D85A30', EN: '#D85A30', VU: '#F59E0B',
  NT: '#78716C', LC: '#00E676', DD: '#888780',
}

const SNASPE_TIPO_LABELS: Record<string, string> = {
  Parques: 'Parque Nacional', Reservas: 'Reserva Nacional', Monumentos: 'Monumento Natural',
}

const ECO_TO_REGIONS: Record<string, string[]> = {
  desierto_atacama:         ['DE TARAPACA', 'DE ANTOFAGASTA'],
  altiplano:                ['DE TARAPACA', 'DE ANTOFAGASTA'],
  matorral_esclerofilo:     ['DE VALPARAISO', 'METROPOLITANA', 'DEL LIBERTADOR B OHIGGINS', 'DEL MAULE'],
  bosque_valdiviano:        ['DEL BIO-BIO', 'DE LA ARAUCANIA', 'DE LOS LAGOS'],
  bosque_andino_patagonico: ['DE AISEN', 'DE MAGALLANES y ANTARTICA CHILENA'],
  litoral_rocoso:           ['DEL BIO-BIO', 'DE LA ARAUCANIA', 'DE LOS LAGOS'],
  humedales:                ['DE AISEN', 'DE MAGALLANES y ANTARTICA CHILENA'],
}

const REGION_CODE_LABELS: Record<string, string> = {
  'I': 'Tarapacá', 'II': 'Antofagasta', 'III': 'Atacama', 'IV': 'Coquimbo',
  'V': 'Valparaíso', 'RM': 'Metropolitana', 'VI': "O'Higgins", 'VII': 'Maule',
  'VIII': 'Biobío', 'IX': 'La Araucanía', 'X': 'Los Lagos', 'XI': 'Aysén',
  'XII': 'Magallanes', 'XIV': 'Los Ríos', 'XV': 'Arica y Parinacota', 'XVI': 'Ñuble',
}

// ── Exported click-info types (used by MapLayout) ────────────
export interface SpeciesClickInfo {
  slug: string
  commonName: string
  scientificName: string
  uicnStatus: UICNStatus | null
  photoUrl: string | null
  observedAt: string | null
  observerName: string | null
}

export interface AreaClickInfo {
  nombre: string
  tipo: string | null
  region: string | null
  superficie_ha: number | null
  slug?: string
}

// ── Internal interfaces ───────────────────────────────────────
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
    regionCode: string | null
  }
}

interface TooltipInfo {
  x: number; y: number
  commonName: string
  photoUrl: string | null
  uicnStatus: UICNStatus | null
  regionCode: string | null
}

interface SnaspeHoverInfo {
  x: number; y: number
  nombre: string
  tipo: string | null
  superficie_ha: number | null
  region: string | null
}

interface Props {
  sightings: SightingFeature[]
  showProtectedAreas?: boolean
  selectedAreaSlugs?: string[]
  onMarkerClick?: (speciesId: string) => void
  selectedSlug?: string | null
  snaspeTipo?: string | null
  snaspeRegions?: Set<string>
  snaspeEcos?: Set<string>
  onSpeciesClick?: (info: SpeciesClickInfo) => void
  onAreaClick?: (info: AreaClickInfo) => void
}

export function RayenMap({
  sightings, showProtectedAreas = false, selectedAreaSlugs = [],
  onMarkerClick, selectedSlug,
  snaspeTipo, snaspeRegions, snaspeEcos,
  onSpeciesClick, onAreaClick,
}: Props) {
  const mapRef = useRef<MapRef>(null)
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)
  const [snaspeHover, setSnaspeHover] = useState<SnaspeHoverInfo | null>(null)
  const [areasGeojson, setAreasGeojson] = useState<any>(null)
  const [snaspeGeojson, setSnaspeGeojson] = useState<any>(null)
  const [locating, setLocating] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const hoveredSnaspeId = useRef<number | null>(null)

  // ── Load protected areas points ───────────────────────────
  useEffect(() => {
    if (!showProtectedAreas) { setAreasGeojson(null); return }
    fetch('/api/protected-areas').then(r => r.json()).then(setAreasGeojson).catch(() => setAreasGeojson(null))
  }, [showProtectedAreas])

  // ── Load SNASPE polygons on mount ─────────────────────────
  useEffect(() => {
    fetch('/api/snaspe')
      .then(r => r.json())
      .then(data => {
        console.log('[SNASPE] features:', data.features?.length)
        if (data?.features?.length) setSnaspeGeojson(data)
      })
      .catch((err) => { console.error('[SNASPE] fetch error:', err); setSnaspeGeojson(null) })
  }, [])

  // ── Feature-state: selected/dimmed by active filters ─────
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map || !mapLoaded || !snaspeGeojson) return
    if (!map.getSource('snaspe')) return

    const hasTipo   = snaspeTipo != null
    const hasRegion = (snaspeRegions?.size ?? 0) > 0
    const hasEco    = (snaspeEcos?.size ?? 0) > 0
    const hasFilter = hasTipo || hasRegion || hasEco

    let ecoRegions: Set<string> | null = null
    if (hasEco && snaspeEcos) {
      ecoRegions = new Set<string>()
      snaspeEcos.forEach((eco) => { ;(ECO_TO_REGIONS[eco] ?? []).forEach((r) => ecoRegions!.add(r)) })
    }

    snaspeGeojson.features.forEach((f: any) => {
      const id = f.id
      if (id == null) return
      const p = f.properties
      if (!hasFilter) {
        map.setFeatureState({ source: 'snaspe', id }, { selected: false, dimmed: false }); return
      }
      let matches = true
      if (hasTipo) {
        matches = snaspeTipo === '__sin_tipo__' ? (!p.tipo || p.tipo === '') : p.tipo === snaspeTipo
      }
      if (matches && hasRegion && snaspeRegions) matches = snaspeRegions.has(p.region)
      if (matches && ecoRegions) matches = ecoRegions.has(p.region)
      map.setFeatureState({ source: 'snaspe', id }, { selected: matches, dimmed: !matches })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snaspeTipo, snaspeRegions, snaspeEcos, snaspeGeojson, mapLoaded])

  // ── FlyTo on species select ───────────────────────────────
  useEffect(() => {
    if (!selectedSlug) return
    const map = mapRef.current
    if (!map) return
    const hits = sightings.filter((s) => s.properties.slug === selectedSlug)
    if (!hits.length) return
    const lngs = hits.map((s) => s.geometry.coordinates[0])
    const lats = hits.map((s) => s.geometry.coordinates[1])
    map.flyTo({
      center: [lngs.reduce((a, b) => a + b, 0) / lngs.length, lats.reduce((a, b) => a + b, 0) / lats.length],
      zoom: hits.length === 1 ? 11 : 8, duration: 1200,
    })
  }, [selectedSlug, sightings])

  const filteredAreasGeojson = useMemo(() => {
    if (!areasGeojson) return null
    if (!selectedAreaSlugs.length) return areasGeojson
    return { ...areasGeojson, features: areasGeojson.features.filter((f: any) => selectedAreaSlugs.includes(f.properties.slug)) }
  }, [areasGeojson, selectedAreaSlugs])

  useEffect(() => {
    if (!selectedAreaSlugs.length || !areasGeojson || !mapRef.current) return
    const sel = areasGeojson.features.filter((f: any) => selectedAreaSlugs.includes(f.properties.slug))
    if (!sel.length) return
    const lngs: number[] = sel.map((f: any) => f.geometry.coordinates[0])
    const lats: number[] = sel.map((f: any) => f.geometry.coordinates[1])
    mapRef.current.flyTo({
      center: [lngs.reduce((a, b) => a + b, 0) / lngs.length, lats.reduce((a, b) => a + b, 0) / lats.length],
      zoom: sel.length === 1 ? 9 : 6, duration: 1200,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreaSlugs.join(','), areasGeojson])

  const geojson = useMemo(() => ({ type: 'FeatureCollection' as const, features: sightings }), [sightings])

  // Only include a layer in interactiveLayerIds when it's actually mounted —
  // react-map-gl queries these internally on every pointer event and throws
  // if a listed layer doesn't exist in the map style.
  const interactiveLayers = useMemo(() => {
    const base: string[] = ['clusters', 'unclustered-point']
    if (snaspeGeojson) base.push('snaspe-fill')
    if (showProtectedAreas && filteredAreasGeojson) base.push('areas-circle')
    return base
  }, [snaspeGeojson, showProtectedAreas, filteredAreasGeojson])

  // ── Layer definitions ─────────────────────────────────────
  const snaspeFillLayer: LayerProps = {
    id: 'snaspe-fill', type: 'fill', source: 'snaspe',
    paint: {
      'fill-color': '#00E676',
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'],    false], 0.5,
        ['boolean', ['feature-state', 'selected'], false], 0.5,
        ['boolean', ['feature-state', 'dimmed'],   false], 0.03,
        0.12,
      ] as any,
    },
  }

  const snaspeLineLayer: LayerProps = {
    id: 'snaspe-line', type: 'line', source: 'snaspe',
    paint: {
      'line-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#000000', '#00E676'] as any,
      'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 5, ['boolean', ['feature-state', 'selected'], false], 3, 2] as any,
      'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, ['boolean', ['feature-state', 'selected'], false], 1, ['boolean', ['feature-state', 'dimmed'], false], 0.2, 0.8] as any,
    },
  }

  const snaspeGlowLayer: LayerProps = {
    id: 'snaspe-glow', type: 'line', source: 'snaspe',
    paint: {
      'line-color': '#00E676',
      'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 12, 0] as any,
      'line-opacity': ['case', ['boolean', ['feature-state', 'dimmed'], false], 0, ['case', ['boolean', ['feature-state', 'hover'], false], 0.3, 0]] as any,
      'line-blur': 6,
    },
  }

  const clusterLayer: LayerProps = {
    id: 'clusters', type: 'circle', source: 'sightings',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#0A0A0A',
      'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 30],
      'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-opacity': 0.92,
    },
  }

  const clusterCountLayer: LayerProps = {
    id: 'cluster-count', type: 'symbol', source: 'sightings',
    filter: ['has', 'point_count'],
    layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'], 'text-size': 13 },
    paint: { 'text-color': '#ffffff' },
  }

  const pointLayer: LayerProps = {
    id: 'unclustered-point', type: 'circle', source: 'sightings',
    filter: ['!', ['has', 'point_count']],
    paint: { 'circle-color': UICN_COLOR_EXPRESSION, 'circle-radius': 7, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' },
  }

  const areaCircleLayer: LayerProps = {
    id: 'areas-circle', type: 'circle', source: 'protected-areas',
    paint: {
      'circle-color': '#22c55e', 'circle-opacity': 0.25,
      'circle-stroke-color': '#16a34a', 'circle-stroke-width': 2, 'circle-stroke-opacity': 0.7,
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 12, 8, 30, 12, 60],
    },
  }

  const areaLabelLayer: LayerProps = {
    id: 'areas-label', type: 'symbol', source: 'protected-areas', minzoom: 6,
    layout: { 'text-field': ['get', 'name'], 'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'], 'text-size': 11, 'text-anchor': 'top', 'text-offset': [0, 1.2], 'text-max-width': 10 },
    paint: { 'text-color': '#166534', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
  }

  // ── Click handler ─────────────────────────────────────────
  const onClick = useCallback((e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap()
    if (!map) return

    if (map.getLayer('areas-circle')) {
      const areaHits = map.queryRenderedFeatures(e.point, { layers: ['areas-circle'] })
      if (areaHits.length > 0) {
        const p = areaHits[0].properties
        onAreaClick?.({ nombre: p?.name ?? '', tipo: p?.type ?? null, region: p?.regionName ?? null, superficie_ha: p?.areaHa ?? null, slug: p?.slug ?? undefined })
        return
      }
    }

    if (map.getLayer('snaspe-fill')) {
      const snaspeHits = map.queryRenderedFeatures(e.point, { layers: ['snaspe-fill'] })
      if (snaspeHits.length > 0) {
        const p = snaspeHits[0].properties
        onAreaClick?.({ nombre: p?.nombre ?? '', tipo: p?.tipo ?? null, region: p?.region ?? null, superficie_ha: p?.superficie_ha ?? null })
        return
      }
    }

    const clusterHits = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    if (clusterHits.length > 0) {
      map.easeTo({ center: [e.lngLat.lng, e.lngLat.lat], zoom: Math.min(map.getZoom() + 2, 16), duration: 500 })
      return
    }

    const features = e.features
    if (!features?.length) return
    const feature = features[0]
    const p = feature.properties
    if (!p?.slug) return
    const coords = (feature.geometry as any)?.coordinates
    if (!Array.isArray(coords) || coords.length < 2) return

    onSpeciesClick?.({
      slug: p.slug, commonName: p.commonName ?? '', scientificName: p.scientificName ?? '',
      uicnStatus: p.uicnStatus ?? null, photoUrl: p.photoUrl ?? null,
      observedAt: p.observedAt ?? null, observerName: p.observerName ?? null,
    })
    onMarkerClick?.(p.speciesId)
  }, [onMarkerClick, onSpeciesClick, onAreaClick])

  // ── Hover handler ─────────────────────────────────────────
  const onMouseMove = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current?.getMap()
    if (!map) return

    const hits = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
    if (hits.length > 0) {
      const p = hits[0].properties
      map.getCanvas().style.cursor = 'pointer'
      setTooltip({ x: e.point.x, y: e.point.y, commonName: p?.commonName ?? '', photoUrl: p?.photoUrl ?? null, uicnStatus: p?.uicnStatus ?? null, regionCode: p?.regionCode ?? null })
      setSnaspeHover(null)
      return
    }

    if (map.getLayer('areas-circle')) {
      const areaHits = map.queryRenderedFeatures(e.point, { layers: ['areas-circle'] })
      if (areaHits.length > 0) {
        const p = areaHits[0].properties
        map.getCanvas().style.cursor = 'pointer'
        setTooltip({ x: e.point.x, y: e.point.y, commonName: p?.name ?? '', photoUrl: null, uicnStatus: null, regionCode: null })
        setSnaspeHover(null)
        return
      }
    }

    const snaspeHits = map.getLayer('snaspe-fill')
      ? map.queryRenderedFeatures(e.point, { layers: ['snaspe-fill'] })
      : []
    if (snaspeHits.length > 0) {
      const feature = snaspeHits[0]
      const p = feature.properties
      const fid = feature.id as number | undefined
      if (hoveredSnaspeId.current !== null) map.setFeatureState({ source: 'snaspe', id: hoveredSnaspeId.current }, { hover: false })
      if (fid != null) { map.setFeatureState({ source: 'snaspe', id: fid }, { hover: true }); hoveredSnaspeId.current = fid }
      map.getCanvas().style.cursor = 'pointer'
      setTooltip(null)
      setSnaspeHover({ x: e.point.x, y: e.point.y, nombre: p?.nombre ?? '', tipo: p?.tipo ?? null, superficie_ha: p?.superficie_ha ?? null, region: p?.region ?? null })
      return
    }

    if (hoveredSnaspeId.current !== null) {
      map.setFeatureState({ source: 'snaspe', id: hoveredSnaspeId.current }, { hover: false })
      hoveredSnaspeId.current = null
    }
    const clusterHits = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    map.getCanvas().style.cursor = clusterHits.length > 0 ? 'pointer' : ''
    setTooltip(null); setSnaspeHover(null)
  }, [])

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (map && hoveredSnaspeId.current !== null) {
      map.setFeatureState({ source: 'snaspe', id: hoveredSnaspeId.current }, { hover: false })
      hoveredSnaspeId.current = null
    }
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = ''
    setTooltip(null); setSnaspeHover(null)
  }, [])

  function handleLocate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 11, duration: 1200 }); setLocating(false) },
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
        interactiveLayerIds={interactiveLayers}
        onLoad={() => setMapLoaded(true)}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        maxBounds={[[-110, -57], [-50, -17]]}
        minZoom={3}
        maxZoom={16}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {snaspeGeojson && (
          <Source id="snaspe" type="geojson" data={snaspeGeojson}>
            <Layer {...snaspeFillLayer} />
            <Layer {...snaspeGlowLayer} />
            <Layer {...snaspeLineLayer} />
          </Source>
        )}

        {showProtectedAreas && filteredAreasGeojson && (
          <Source id="protected-areas" type="geojson" data={filteredAreasGeojson}>
            <Layer {...areaCircleLayer} />
            <Layer {...areaLabelLayer} />
          </Source>
        )}

        <Source id="sightings" type="geojson" data={geojson} cluster clusterMaxZoom={12} clusterRadius={50}>
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...pointLayer} />
        </Source>
      </Map>

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

// ── Tooltip styles shared ────────────────────────────────────
const TOOLTIP_STYLE: React.CSSProperties = {
  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,230,118,0.1)',
  background: 'rgba(24,24,27,0.97)',
  border: '1px solid rgba(63,63,70,0.5)',
  backdropFilter: 'blur(12px)',
}

// ── Elevated hover tooltip — species / area circles ──────────
function HoverTooltip({ tooltip }: { tooltip: TooltipInfo }) {
  const { x, y, commonName, photoUrl, uicnStatus, regionCode } = tooltip
  const uicnColor = uicnStatus ? (UICN_COLORS[uicnStatus] ?? '#666') : null

  return (
    <div
      className="pointer-events-none absolute z-20 w-64 rounded-2xl overflow-hidden"
      style={{ left: x + 16, top: Math.max(8, y - 80), ...TOOLTIP_STYLE }}
    >
      {photoUrl && (
        <div className="relative">
          <img src={photoUrl} alt={commonName} referrerPolicy="no-referrer" className="w-full h-32 object-cover" />
          {uicnStatus && uicnColor && (
            <span className="absolute top-2 left-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: uicnColor }}>
              {uicnStatus}
            </span>
          )}
        </div>
      )}
      <div className="p-3">
        {!photoUrl && uicnStatus && uicnColor && (
          <span className="inline-block mb-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: uicnColor }}>
            {UICN_LABELS[uicnStatus as keyof typeof UICN_LABELS] ?? uicnStatus}
          </span>
        )}
        <p className="font-grotesk font-semibold text-white text-base leading-tight truncate">{commonName}</p>
        {regionCode && REGION_CODE_LABELS[regionCode] && (
          <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {REGION_CODE_LABELS[regionCode]}
          </p>
        )}
        <p className="text-zinc-600 text-[11px] mt-2 text-center">Click para ver ficha</p>
      </div>
    </div>
  )
}

// ── Elevated hover tooltip — SNASPE polygons ─────────────────
function SnaspeTooltip({ info }: { info: SnaspeHoverInfo }) {
  const { x, y, nombre, tipo, superficie_ha, region } = info
  const tipoLabel = tipo ? (SNASPE_TIPO_LABELS[tipo] ?? tipo) : null
  const displayName = nombre.replace(/\s*\[.*?\]\s*$/, '').trim()
  const TipoIcon = tipo === 'Parques' ? TreePine : tipo === 'Reservas' ? Shield : tipo === 'Monumentos' ? Star : TreePine

  return (
    <div
      className="pointer-events-none absolute z-20 w-64 rounded-2xl p-4"
      style={{ left: x + 16, top: Math.max(8, y - 80), ...TOOLTIP_STYLE }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <TipoIcon className="w-6 h-6" style={{ color: '#00E676' }} />
        </div>
        <div className="min-w-0">
          <p className="font-grotesk font-semibold text-white text-base leading-tight truncate">{displayName}</p>
          {tipoLabel && <p className="text-[#00E676] text-xs mt-0.5">{tipoLabel}</p>}
        </div>
      </div>
      {superficie_ha != null && (
        <p className="text-zinc-400 text-sm">{Number(superficie_ha).toLocaleString('es-CL')} ha</p>
      )}
      {region && (
        <p className="text-zinc-500 text-xs mt-0.5">
          {region.charAt(0).toUpperCase() + region.slice(1).toLowerCase()}
        </p>
      )}
      <p className="text-zinc-600 text-[11px] mt-2 text-center">Click para ver ficha</p>
    </div>
  )
}
