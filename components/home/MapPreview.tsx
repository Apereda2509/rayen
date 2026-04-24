'use client'

import Map from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export default function MapPreview() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) {
    return <div className="w-full h-full bg-zinc-800 rounded-2xl" />
  }

  return (
    <Map
      mapboxAccessToken={token}
      initialViewState={{ longitude: -71.5, latitude: -35.5, zoom: 3.8 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      interactive={false}
      attributionControl={false}
    />
  )
}
