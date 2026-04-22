'use client'

import { useCallback } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl'
import { MapPin } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Props {
  value: { lat: number; lng: number } | null
  onChange: (point: { lat: number; lng: number }) => void
}

export function MapPicker({ value, onChange }: Props) {
  const handleClick = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    },
    [onChange]
  )

  return (
    <div className="rounded-xl overflow-hidden border border-stone-200 h-64 cursor-crosshair">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ longitude: -71, latitude: -35.5, zoom: 3.4 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        onClick={handleClick}
        cursor="crosshair"
      >
        <NavigationControl position="top-right" showCompass={false} />
        {value && (
          <Marker longitude={value.lng} latitude={value.lat}>
            <div className="flex flex-col items-center -translate-y-full">
              <div className="bg-teal-600 text-white rounded-full p-1.5 shadow-lg ring-2 ring-white">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="w-0.5 h-2 bg-teal-600" />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  )
}
