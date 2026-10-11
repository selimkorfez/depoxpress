import type { Metadata, Viewport } from 'next'
import { href, type Locale, type PageKey } from './routes'
import { SITE, siteUrl } from './site'

export const viewport: Viewport = { themeColor: '#f4f1ea' }

export function pageMetadata(locale: Locale, key: PageKey, meta: { title: string; description: string }): Metadata {
  const url = href(locale, key)
  return {
    metadataBase: new URL(siteUrl()),
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical: url,
      languages: { 'en-GB': href('en', key), tr: href('tr', key), 'x-default': href('en', key) },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: SITE.brand,
      type: 'website',
      locale: locale === 'en' ? 'en_GB' : 'tr_TR',
      alternateLocale: locale === 'en' ? ['tr_TR'] : ['en_GB'],
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
    icons: { icon: '/icon.svg' },
  }
}
