export const LOCALES = ['en', 'tr'] as const
export type Locale = (typeof LOCALES)[number]

export const SERVICE_IDS = [
  'ecommerce',
  'warehousing',
  'fbaPrep',
  'fbm',
  'returns',
  'kitting',
  'pickPack',
  'b2b',
] as const
export type ServiceId = (typeof SERVICE_IDS)[number]

export type StaticKey =
  | 'home'
  | 'services'
  | 'solutions'
  | 'howItWorks'
  | 'technology'
  | 'integrations'
  | 'locations'
  | 'pricing'
  | 'about'
  | 'contact'
  | 'quote'
  | 'privacy'
  | 'cookies'
  | 'terms'
  | 'legal'

export type PageKey = StaticKey | `service:${ServiceId}`

/** URL slugs per language. English keeps the existing site's URLs; Turkish keeps its localised ones. */
const STATIC_SLUGS: Record<Locale, Record<StaticKey, string>> = {
  en: {
    home: '',
    services: 'services',
    solutions: 'solutions',
    howItWorks: 'how-it-works',
    technology: 'technology',
    integrations: 'integrations',
    locations: 'our-locations',
    pricing: 'pricing',
    about: 'about',
    contact: 'contact',
    quote: 'get-a-quote',
    privacy: 'privacy-policy',
    cookies: 'cookie-policy',
    terms: 'terms-and-conditions',
    legal: 'legal',
  },
  tr: {
    home: '',
    services: 'hizmetler',
    solutions: 'cozumler',
    howItWorks: 'nasil-calisir',
    technology: 'teknoloji',
    integrations: 'entegrasyonlar',
    locations: 'lokasyonlarimiz',
    pricing: 'fiyatlandirma',
    about: 'hakkimizda',
    contact: 'iletisim',
    quote: 'teklif-al',
    privacy: 'gizlilik-politikasi',
    cookies: 'cerez-politikasi',
    terms: 'kullanim-sartlari',
    legal: 'yasal-bilgiler',
  },
}

const SERVICE_SLUGS: Record<Locale, Record<ServiceId, string>> = {
  en: {
    ecommerce: 'ecommerce-fulfilment',
    warehousing: 'warehousing',
    fbaPrep: 'amazon-fba-prep',
    fbm: 'amazon-fbm-fulfilment',
    returns: 'returns-management',
    kitting: 'kitting-repacking',
    pickPack: 'pick-pack',
    b2b: 'b2b-fulfilment',
  },
  tr: {
    ecommerce: 'e-ticaret-fulfillment',
    warehousing: 'depolama',
    fbaPrep: 'amazon-fba-prep',
    fbm: 'amazon-fbm-fulfillment',
    returns: 'iade-yonetimi',
    kitting: 'kitleme-yeniden-paketleme',
    pickPack: 'toplama-paketleme',
    b2b: 'b2b-fulfillment',
  },
}

const prefix = (locale: Locale) => (locale === 'en' ? '' : `/${locale}`)

/** Path for a page in a language, e.g. href('tr', 'pricing') → /tr/fiyatlandirma */
export function href(locale: Locale, key: PageKey, hash?: string): string {
  let path: string
  if (key.startsWith('service:')) {
    const id = key.slice(8) as ServiceId
    path = `${STATIC_SLUGS[locale].services}/${SERVICE_SLUGS[locale][id]}`
  } else {
    path = STATIC_SLUGS[locale][key as StaticKey]
  }
  const full = `${prefix(locale)}/${path}`.replace(/\/$/, '') || '/'
  return hash ? `${full}#${hash}` : full
}

/** Which page a URL (segments after the language prefix) points to. */
export function resolve(locale: Locale, segments: string[] = []): PageKey | null {
  const path = segments.map((s) => decodeURIComponent(s)).join('/')
  for (const [key, slug] of Object.entries(STATIC_SLUGS[locale])) {
    if (slug === path) return key as StaticKey
  }
  const servicesSlug = STATIC_SLUGS[locale].services
  if (segments.length === 2 && segments[0] === servicesSlug) {
    for (const [id, slug] of Object.entries(SERVICE_SLUGS[locale])) {
      if (slug === segments[1]) return `service:${id as ServiceId}`
    }
  }
  return null
}

export const ALL_KEYS: PageKey[] = [
  ...(Object.keys(STATIC_SLUGS.en) as StaticKey[]),
  ...SERVICE_IDS.map((id) => `service:${id}` as const),
]

/** Segments for generateStaticParams. */
export function staticSegments(locale: Locale): string[][] {
  return ALL_KEYS.map((key) => {
    const p = href(locale, key).replace(/^\/(tr)?/, '').replace(/^\//, '')
    return p ? p.split('/') : []
  })
}
