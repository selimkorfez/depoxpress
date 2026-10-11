import Link from 'next/link'
import type { Dict } from '@/content'
import { href, type Locale } from '@/lib/routes'
import { SITE, whatsappLink } from '@/lib/site'
import { Facebook, Instagram, WhatsApp } from './Icons'
import { Logo } from './Header'

export function Footer({ locale, t }: { locale: Locale; t: Dict }) {
  const f = t.footer
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="footer-big" aria-hidden="true">
          DEPOXPRESS UK
        </p>
        <div className="footer-top">
          <div className="footer-brand">
            <Logo homeHref={href(locale, 'home')} label={`${SITE.brand} — ${t.common.home}`} />
            <p>{f.tagline}</p>
            <div className="footer-contact">
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              <a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a>
            </div>
            <div className="footer-social">
              <a href={whatsappLink(t.common.whatsappMessage)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsApp size={20} />
              </a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram />
              </a>
              <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook />
              </a>
            </div>
          </div>
          <div>
            <h3>{f.servicesHeading}</h3>
            <ul>
              <li>
                <Link href={href(locale, 'services')}>{f.allServices}</Link>
              </li>
              <li>
                <Link href={href(locale, 'pricing')}>{t.nav.pricing}</Link>
              </li>
              <li>
                <Link href={href(locale, 'howItWorks')}>{t.nav.howItWorks}</Link>
              </li>
              <li>
                <Link href={href(locale, 'technology')}>{t.nav.technology}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>{f.companyHeading}</h3>
            <ul>
              <li>
                <Link href={href(locale, 'about')}>{t.nav.about}</Link>
              </li>
              <li>
                <Link href={href(locale, 'locations')}>{t.nav.locations}</Link>
              </li>
              <li>
                <Link href={href(locale, 'contact')}>{t.nav.contact}</Link>
              </li>
              <li>
                <Link href={href(locale, 'quote')}>{t.common.getQuote}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>{f.legalHeading}</h3>
            <ul>
              <li>
                <Link href={href(locale, 'privacy')}>{f.privacy}</Link>
              </li>
              <li>
                <Link href={href(locale, 'cookies')}>{f.cookies}</Link>
              </li>
              <li>
                <Link href={href(locale, 'terms')}>{f.terms}</Link>
              </li>
              <li>
                <Link href={href(locale, 'legal')}>{f.legal}</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-addresses">
          <div>
            <h3>{f.registeredOffice}</h3>
            <address>
              {SITE.registeredOffice.map((l) => (
                <span key={l}>
                  {l}
                  <br />
                </span>
              ))}
            </address>
          </div>
          <div>
            <h3>{f.fulfilmentCentre}</h3>
            <address>
              {SITE.fulfilmentCentre.map((l) => (
                <span key={l}>
                  {l}
                  <br />
                </span>
              ))}
            </address>
          </div>
          <div>
            <h3>{f.germanyOperation}</h3>
            <address>
              {SITE.germany.operator}
              <br />
              {SITE.germany.address.map((l) => (
                <span key={l}>
                  {l}
                  <br />
                </span>
              ))}
              <a href={SITE.germany.url} target="_blank" rel="noopener noreferrer">
                {SITE.germany.urlDisplay}
              </a>
            </address>
          </div>
        </div>
        <div className="footer-legal">
          <p>
            {SITE.legalName} · {f.companyNo} {SITE.companyNo} · {f.vatNo} {SITE.vat} · EORI: {SITE.eori}
            <br />
            {f.separate}
          </p>
          <p>
            © {year} {SITE.legalName}. {f.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
