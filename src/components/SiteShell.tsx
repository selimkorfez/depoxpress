import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import '@/app/globals.css'
import { getDict } from '@/content'
import { href, type Locale } from '@/lib/routes'
import { SITE, siteUrl, whatsappLink } from '@/lib/site'
import { Header } from './Header'
import { Footer } from './Footer'
import { MotionProvider, ScrollFX } from './Motion'
import { WhatsApp } from './Icons'

const sans = Archivo({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', axes: ['wdth'], display: 'swap' })
const mono = IBM_Plex_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-mono', weight: ['400', '500', '600'], display: 'swap' })

export function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = getDict(locale)
  const nav = (
    [
      ['services', t.nav.services],
      ['solutions', t.nav.solutions],
      ['howItWorks', t.nav.howItWorks],
      ['technology', t.nav.technology],
      ['locations', t.nav.locations],
      ['pricing', t.nav.pricing],
      ['about', t.nav.about],
      ['contact', t.nav.contact],
    ] as const
  ).map(([key, label]) => ({ href: href(locale, key), label }))

  // Tells search engines who runs the site and where the fulfilment centre is
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl()}/#business`,
    name: SITE.brand,
    legalName: SITE.legalName,
    url: siteUrl(),
    email: SITE.email,
    telephone: SITE.phone,
    image: `${siteUrl()}/images/warehouse/davenport-business-centre-hinckley-exterior-01.jpg`,
    description: t.home.meta.description,
    vatID: SITE.vat,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Davenport Business Centre, Unit 1, John Street',
      addressLocality: 'Hinckley',
      addressRegion: 'Leicestershire',
      postalCode: 'LE10 1UZ',
      addressCountry: 'GB',
    },
    areaServed: 'GB',
    sameAs: [SITE.instagram, SITE.facebook],
  }

  return (
    <html lang={locale === 'en' ? 'en-GB' : 'tr'} className={`${sans.variable} ${mono.variable}`}>
      <body>
        <noscript>
          {/* without JavaScript, show content that would otherwise animate in */}
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}.hero3d-panel:not(.is-first){opacity:1!important;visibility:visible!important;grid-area:auto!important}.hero3d{height:auto!important}.hero3d-stage{position:relative!important;height:auto!important}`}</style>
        </noscript>
        <a href="#main" className="skip-link">
          {t.common.skip}
        </a>
        <MotionProvider>
          <Header
            locale={locale}
            nav={nav}
            homeHref={href(locale, 'home')}
            quoteHref={href(locale, 'quote')}
            quoteLabel={t.common.getQuote}
            labels={{ home: `${SITE.brand} — ${t.common.home}`, open: t.common.openMenu, close: t.common.closeMenu, nav: t.common.mainNav, switchLanguage: t.common.switchLanguage }}
          />
          <main id="main">{children}</main>
          <Footer locale={locale} t={t} />
        </MotionProvider>
        <a className="wa-float" href={whatsappLink(t.common.whatsappMessage)} target="_blank" rel="noopener noreferrer" aria-label={`${t.common.whatsapp} ${SITE.phoneDisplay}`}>
          <WhatsApp size={28} />
        </a>
        <ScrollFX />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  )
}
