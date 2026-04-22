export const dynamic = 'force-dynamic'

const ALLOWED_HOSTS = [
  'upload.wikimedia.org',
  'commons.wikimedia.org',
  'static.inaturalist.org',
  'inaturalist-open-data.s3.amazonaws.com',
  'res.cloudinary.com',
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return new Response('Missing url param', { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new Response('Invalid url', { status: 400 })
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return new Response('Host not allowed', { status: 403 })
  }

  const upstream = await fetch(url, {
    headers: {
      'User-Agent': 'Rayen/1.0 (https://rayen.cl; contact@rayen.cl)',
      Referer: 'https://en.wikipedia.org/',
    },
  })

  if (!upstream.ok) {
    return new Response(`Upstream error ${upstream.status}`, { status: 502 })
  }

  const contentType = upstream.headers.get('Content-Type') ?? 'image/jpeg'
  const body = await upstream.arrayBuffer()

  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    },
  })
}
