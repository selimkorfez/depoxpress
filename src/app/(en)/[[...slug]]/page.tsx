import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { renderPage, metadataFor } from '@/views/render'
import { resolve, staticSegments } from '@/lib/routes'

export const dynamicParams = false

export function generateStaticParams() {
  return staticSegments('en').map((slug) => ({ slug }))
}

type Props = { params: Promise<{ slug?: string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const key = resolve('en', slug)
  return key ? metadataFor('en', key) : {}
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const key = resolve('en', slug)
  if (!key) notFound()
  return renderPage('en', key)
}
