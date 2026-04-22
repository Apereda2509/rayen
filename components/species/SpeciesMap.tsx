'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Map, {
  Source, Layer, Popup, NavigationControl,
} from 'react-map-gl'
import type { LayerProps, MapLayerMouseEvent } from 'react-map-gl'

const UICN_COLORS: Record<string, string> = {
  CR: '#D85A30', EN: '#BA7517', VU: '#EF9F27',
  NT: '#639922', LC: '#1D9E75', DD: '#888780',
}

const REGION_NAMES: Record<string, string> = {
  AP: 'Arica y Parinacota', TA: 'Tarapacá', AN: 'Antofagasta',
  AT: 'Atacama', CO: 'Coquimbo', VA: 'Valparaíso', RM: 'Metropolitana',
  LI: "O'Higgins", ML: 'Maule', NB: 'Ñuble', BI: 'Biobío',
  AR: 'La Araucanía', LR: 'Los Ríos', LL: 'Los Lagos',
  AI: 'Aysén', MA: 'Magallanes',
}

interface SightingPoint {
  id: string
  lat: number
  lng: number
  observedAt: string
  regionCode: string | null
}

interface PopupInfo {
  longitude: number
  latitude: number
  observedAt: string
  regionCode: string | null
}

interface Props {
  slug: string
  uicnStatus: string | null
}

export function SpeciesMap({ slug, uicnStatus }: Props) {
  const [sightings, setSightings] = useState<SightingPoint[]>([])
  const [popup, setPopup] = useState<PopupInfo | null>(null)

  useEffect(() => {
    fetch(`/api/species/${slug}/sightings`)
      .then(r => r.json())
      .then(j => setSightings(j.data ?? []))
      .catch(() => {})
  }, [slug])

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: sightings.map(s => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] as [number, number] },
      properties: { id: s.id, observedAt: s.observedAt, regionCode: s.regionCode },
    })),
  }), [sightings])

  const pointColor = UICN_COLORS[uicnStatus ?? ''] ?? '#085041'

  const pointLayer: LayerProps = {
    id: 'species-points',
    type: 'circle',
    source: 'species-points',
    paint: {
      'circle-color': pointColor,
      'circle-radius': 7,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.85,
    },
  }

  const onClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0]
    if (!feature) { setPopup(null); return }
    const coords = (feature.geometry as any).coordinates as [number, number]
    setPopup({
      longitude: coords[0],
      latitude: coords[1],
      observedAt: feature.properties?.observedAt ?? '',
      regionCode: feature.properties?.regionCode ?? null,
    })
  }, [])

  if (sightings.length === 0) return null

  return (
    <div
      className="rounded-xl overflow-hidden border border-stone-200 mb-6"
      style={{ height: 320 }}
    >
      <Map
        initialViewState={{ longitude: -71.5, latitude: -38.5, zoom: 4 }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['species-points']}
        onClick={onClick}
        maxBounds={[[-110, -57], [-50, -17]]}
        minZoom={3}
        maxZoom={14}
        cursor="auto"
      >
        <NavigationControl position="top-right" showCompass={false} />

        <Source id="species-points" type="geojson" data={geojson}>
          <Layer {...pointLayer} />
        </Source>

        {popup && (
          <Popup
            longitude={popup.longitude}
            latitude={popup.latitude}
            anchor="bottom"
            offset={12}
            closeOnClick={false}
            onClose={() => setPopup(null)}
            maxWidth="220px"
          >
            <div className="p-2 text-sm space-y-0.5">
              <p className="font-medium text-stone-800">
                {new Date(popup.observedAt).toLocaleDateString('es-CL', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
              {popup.regionCode && (
                <p className="text-stone-500 text-xs">
                  📍 {REGION_NAMES[popup.regionCode] ?? popup.regionCode}
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}
