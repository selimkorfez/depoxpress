/** Company facts that are the same in every language. */
export const SITE = {
  brand: 'Depoxpress UK',
  legalName: 'DEPOXRESS UK LTD',
  companyNo: '17342377',
  vat: 'GB 525 0847 94',
  eori: 'GB525084794000',
  email: 'info@depoxpress.com',
  phone: '+447345985619',
  phoneDisplay: '+44 7345 985619',
  whatsapp: '447345985619',
  instagram: 'https://www.instagram.com/depoxpressuk/',
  facebook: 'https://www.facebook.com/share/1BpKfe1vqv/?mibextid=wwXIfr',
  registeredOffice: ['19 Sutton Close', 'Oadby', 'Leicestershire', 'LE2 5WT', 'United Kingdom'],
  fulfilmentCentre: ['Davenport Business Centre', 'Unit 1, John Street', 'Hinckley', 'Leicestershire', 'LE10 1UZ', 'United Kingdom'],
  mapQuery: 'Davenport Business Centre, John Street, Hinckley LE10 1UZ',
  germany: {
    operator: 'Trading Freaks GmbH',
    address: ['Am Schafhaus 35', '53557 Bad Hönningen', 'Germany'],
    phone: '+491623281770',
    phoneDisplay: '+49 162 328 1770',
    url: 'https://depoxpress.com/',
    urlDisplay: 'depoxpress.com',
  },
} as const

export function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://depoxpress.co.uk')
  return url.replace(/\/$/, '')
}

export const whatsappLink = (message: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`
export const mapsLink = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapQuery)}`
export const mapsEmbed = () => `https://www.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&output=embed`
