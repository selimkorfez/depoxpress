import type { Metadata } from 'next'
import { getDict } from '@/content'
import { pageMetadata } from '@/lib/metadata'
import type { Locale, PageKey, ServiceId } from '@/lib/routes'
import { HomePage } from './HomePage'
import { ServicesPage, ServicePage } from './ServicePages'
import { SolutionsPage, HowItWorksPage } from './ProcessPages'
import { TechnologyPage, IntegrationsPage } from './TechPages'
import { LocationsPage, AboutPage } from './CompanyPages'
import { PricingPage } from './PricingPage'
import { ContactPage, QuotePage } from './ContactPages'
import { LegalPage } from './LegalPage'

export function metadataFor(locale: Locale, key: PageKey): Metadata {
  const t = getDict(locale)
  if (key.startsWith('service:')) return pageMetadata(locale, key, t.services[key.slice(8) as ServiceId].meta)
  const meta = {
    home: t.home.meta,
    services: t.servicesPage.meta,
    solutions: t.solutions.meta,
    howItWorks: t.howItWorks.meta,
    technology: t.technology.meta,
    integrations: t.integrations.meta,
    locations: t.locations.meta,
    pricing: t.pricing.meta,
    about: t.about.meta,
    contact: t.contact.meta,
    quote: t.quote.meta,
    privacy: t.legalDocs.privacy.meta,
    cookies: t.legalDocs.cookies.meta,
    terms: t.legalDocs.terms.meta,
    legal: t.legalDocs.legal.meta,
  }[key as Exclude<PageKey, `service:${string}`>]
  return pageMetadata(locale, key, meta)
}

export function renderPage(locale: Locale, key: PageKey) {
  const t = getDict(locale)
  const props = { locale, t }
  if (key.startsWith('service:')) return <ServicePage {...props} id={key.slice(8) as ServiceId} />
  switch (key) {
    case 'home':
      return <HomePage {...props} />
    case 'services':
      return <ServicesPage {...props} />
    case 'solutions':
      return <SolutionsPage {...props} />
    case 'howItWorks':
      return <HowItWorksPage {...props} />
    case 'technology':
      return <TechnologyPage {...props} />
    case 'integrations':
      return <IntegrationsPage {...props} />
    case 'locations':
      return <LocationsPage {...props} />
    case 'pricing':
      return <PricingPage {...props} />
    case 'about':
      return <AboutPage {...props} />
    case 'contact':
      return <ContactPage {...props} />
    case 'quote':
      return <QuotePage {...props} />
    case 'privacy':
    case 'cookies':
    case 'terms':
    case 'legal':
      return <LegalPage {...props} doc={key} />
  }
}

export type ViewProps = { locale: Locale; t: ReturnType<typeof getDict> }
