import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { renderPage, metadataFor } from '@/views/render'
import { resolve, staticSegments } from '@/lib/routes'

export const dynamicParams = false

export function generateStaticParams() {
  return staticSegments('tr').map((slug) => ({ slug }))
}

type Props = { params: Promise<{ slug?: string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const key = resolve('tr', slug)
  return key ? metadataFor('tr', key) : {}
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const key = resolve('tr', slug)
  if (!key) notFound()
  return renderPage('tr', key)
}
