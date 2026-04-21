'use client'

import { useRef, useState, useCallback, useMemo } from 'react'
import Map, {
  Source, Layer, NavigationControl, GeolocateControl,
  Popup, MapRef, ViewStateChangeEvent,
} from 'react-map-gl'
import type { LayerProps, MapLayerMouseEvent } from 'react-map-gl'
import { SpeciesCard } from '@/components/species/SpeciesCard'
import type { SpeciesSummary, UICNStatus } from '@/lib/types'

// ── Configuración inicial centrada en Chile ──────────────────
const INITIAL_VIEW = {
  longitude: -71.5,
  latitude: -38.5,
  zoom: 4,
  pitch: 0,
  bearing: 0,
}

// ── Colores por estado UICN para los puntos ──────────────────
const UICN_COLOR_EXPRESSION: any = [
  'match', ['get', 'uicnStatus'],
  'CR', '#D85A30',
  'EN', '#BA7517',
  'VU', '#EF9F27',
  'NT', '#639922',
  'LC', '#1D9E75',
  'DD', '#888780',
  /* default */ '#5F5E5A',
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

interface Props {
  sightings: SightingFeature[]
  onMarkerClick?: (speciesId: string) => void
}

export function RayenMap({ sightings, onMarkerClick }: Props) {
  const mapRef = useRef<MapRef>(null)
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number
    latitude: number
    species: SpeciesSummary
  } | null>(null)

  // Convertir sightings a GeoJSON FeatureCollection
  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: sightings,
  }), [sightings])

  // ── Layer: clusters ──
  const clusterLayer: LayerProps = {
    id: 'clusters',
    type: 'circle',
    source: 'sightings',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#085041',
      'circle-radius': [
        'step', ['get', 'point_count'],
        16, 10, 22, 50, 30,
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.92,
    },
  }

  // ── Layer: número en el cluster ──
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
    paint: {
      'text-color': '#ffffff',
    },
  }

  // ── Layer: puntos individuales ──
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

  // ── Click handler ──
  const onClick = useCallback(async (e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap()
    if (!map) return

    // Cluster: detectar con queryRenderedFeatures y hacer zoom simple
    const clusterHits = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    if (clusterHits.length > 0) {
      map.easeTo({
        center: [e.lngLat.lng, e.lngLat.lat],
        zoom: Math.min(map.getZoom() + 2, 16),
        duration: 500,
      })
      return
    }

    // Punto individual: usar e.features
    const features = e.features
    if (!features || features.length === 0) {
      setPopupInfo(null)
      return
    }

    const feature = features[0]
    const slug = feature.properties?.slug
    if (!slug) return

    const coords = (feature.geometry as any)?.coordinates
    if (!Array.isArray(coords) || coords.length < 2) return
    const lng = Number(coords[0])
    const lat = Number(coords[1])
    if (isNaN(lng) || isNaN(lat)) return

    try {
      const res = await fetch(`/api/species/${slug}`)
      if (!res.ok) return
      const { data } = await res.json()
      if (!data) return

      const primaryMedia = data.media?.find((m: any) => m.is_primary) ?? data.media?.[0]
      setPopupInfo({
        longitude: lng,
        latitude: lat,
        species: {
          id: data.id,
          slug: data.slug,
          commonName: data.common_name ?? data.commonName ?? '',
          scientificName: data.scientific_name ?? data.scientificName ?? '',
          type: data.type,
          uicnStatus: data.uicn_status ?? data.uicnStatus ?? null,
          chileStatus: data.chile_status ?? data.chileStatus ?? null,
          isEndemic: data.is_endemic ?? data.isEndemic ?? false,
          sizeCategory: data.size_category ?? data.sizeCategory ?? null,
          dangerLevel: data.danger_level ?? data.dangerLevel ?? 'ninguno',
          colors: data.colors ?? [],
          featured: data.featured ?? false,
          primaryPhoto: primaryMedia?.url ?? null,
          photoCredit: primaryMedia?.credit ?? null,
          regionCodes: data.regionCodes ?? [],
          ecosystemSlugs: data.ecosystemSlugs ?? [],
          verifiedSightings: 0,
        },
      })
      onMarkerClick?.(data.id)
    } catch (err) {
      console.error('Error cargando especie:', err)
    }
  }, [onMarkerClick])

  // Cursor pointer al pasar sobre marcadores
  const onMouseEnter = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = 'pointer'
  }, [])
  const onMouseLeave = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = ''
  }, [])

  return (
    <Map
      ref={mapRef}
      initialViewState={INITIAL_VIEW}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
      interactiveLayerIds={['clusters', 'unclustered-point']}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      maxBounds={[[-110, -57], [-50, -17]]}    // Limitar al área de Chile
      minZoom={3}
      maxZoom={16}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <GeolocateControl position="top-right" />

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

      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          anchor="bottom"
          offset={12}
          closeOnClick={false}
          onClose={() => setPopupInfo(null)}
          maxWidth="280px"
        >
          <SpeciesCard species={popupInfo.species} variant="map-popup" />
        </Popup>
      )}
    </Map>
  )
}
