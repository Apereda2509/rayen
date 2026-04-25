import { notFound } from 'next/navigation'
import { guides, getGuideBySlug } from '@/lib/guides-data'
import { GuideDetailClient } from '@/components/accion/GuideDetailClient'

export async function generateStaticParams() {
  return guides.map(g => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const guide = getGuideBySlug(params.slug)
  if (!guide) return {}
  return {
    title: `${guide.title} — Rayen`,
    description: guide.description,
  }
}

export default function GuideDetailPage({ params }: { params: { slug: string } }) {
  const guide = getGuideBySlug(params.slug)
  if (!guide) notFound()

  const guideNumber = guides.indexOf(guide) + 1

  return <GuideDetailClient guide={guide} guideNumber={guideNumber} />
}
