import type { MetadataRoute } from 'next'
import { ALL_KEYS, href } from '@/lib/routes'
import { siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  return ALL_KEYS.flatMap((key) =>
    (['en', 'tr'] as const).map((locale) => ({
      url: `${base}${href(locale, key)}`,
      lastModified: new Date(),
      changeFrequency: key === 'home' ? ('weekly' as const) : ('monthly' as const),
      priority: key === 'home' ? 1 : key === 'quote' || key === 'services' ? 0.9 : 0.6,
      alternates: { languages: { 'en-GB': `${base}${href('en', key)}`, tr: `${base}${href('tr', key)}` } },
    })),
  )
}
