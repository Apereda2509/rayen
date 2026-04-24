import { MetadataRoute } from 'next'
import { getAllEspecies, getAllAreas } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let especies: { slug: string }[] = []
  let areas: { slug: string }[] = []

  try {
    ;[especies, areas] = await Promise.all([getAllEspecies(), getAllAreas()])
  } catch {
    // DB unavailable at build time — return static pages only
  }

  const baseUrl = 'https://rayen.app'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/especies`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/areas-protegidas`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/mapa`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/comunidad`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/accion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/educacion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/sobre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const especiesPages: MetadataRoute.Sitemap = especies.map((e) => ({
    url: `${baseUrl}/especies/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const areasPages: MetadataRoute.Sitemap = areas.map((a) => ({
    url: `${baseUrl}/areas-protegidas/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...especiesPages, ...areasPages]
}
