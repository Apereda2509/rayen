'use client'

import Map, { Marker, NavigationControl } from 'react-map-gl'

interface Props {
  lat: number
  lng: number
  name: string
}

export function AreaMap({ lat, lng, name }: Props) {
  return (
    <Map
      initialViewState={{ latitude: lat, longitude: lng, zoom: 8 }}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
      interactive={false}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker latitude={lat} longitude={lng} anchor="bottom">
        <div className="flex flex-col items-center">
          <div className="bg-emerald-600 text-white text-xs font-medium px-2 py-1 rounded-lg shadow-md whitespace-nowrap max-w-[200px] truncate">
            {name}
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-emerald-600" />
        </div>
      </Marker>
    </Map>
  )
}
