import Link from 'next/link'
import { ContactList, CtaBand, IMG, Media, PageHero, SectionHead } from '@/components/ui'
import { Counter, GrowBar, Reveal, RevealItem, RevealList } from '@/components/Motion'
import { ArrowRight, ArrowUpRight, Check, Chat, Doc, Expand, Mail, Phone, Globe, Sliders } from '@/components/Icons'
import { href } from '@/lib/routes'
import { SITE } from '@/lib/site'
import type { ViewProps } from './render'

export function LocationsPage({ locale, t }: ViewProps) {
  const l = t.locations
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: l.eyebrow }]} eyebrow={l.eyebrow} title={l.title} lead={l.intro} image={IMG.exterior1} imageAlt={l.imageAlt} imageTag="Davenport Business Centre · Hinckley" />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="sr-only">{l.title}</h2>
          <RevealList className="grid-2">
            <RevealItem className="location-card">
              <header>
                <span className="flag" aria-hidden="true">
                  🇬🇧
                </span>
                <h3>{l.uk.title}</h3>
              </header>
              <address>
                <strong>{SITE.legalName}</strong>
                <br />
                {SITE.fulfilmentCentre.join(', ')}
              </address>
              <p className="location-meta">{l.uk.size}</p>
              <h4>{l.uk.servicesTitle}</h4>
              <ul className="chip-list">
                {l.uk.services.map((s) => (
                  <li key={s} className="chip">
                    <Check size={16} />
                    {s}
                  </li>
                ))}
              </ul>
              <ContactList t={t} />
              <div>
                <Link href={href(locale, 'quote')} className="btn btn-primary">
                  {l.uk.cta} <ArrowRight />
                </Link>
              </div>
            </RevealItem>
            <RevealItem className="location-card">
              <header>
                <span className="flag" aria-hidden="true">
                  🇩🇪
                </span>
                <h3>{l.de.title}</h3>
              </header>
              <address>
                <strong>{SITE.germany.operator}</strong>
                <br />
                {SITE.germany.address.join(', ')}
              </address>
              <h4>{l.de.servicesTitle}</h4>
              <ul className="chip-list">
                {l.de.services.map((s) => (
                  <li key={s} className="chip">
                    <Check size={16} />
                    {s}
                  </li>
                ))}
              </ul>
              <ul className="contact-list">
                <li>
                  <a href={`mailto:${SITE.email}`}>
                    <span className="ci">
                      <Mail />
                    </span>
                    <span>
                      <small>{t.common.emailUs}</small>
                      <strong>{SITE.email}</strong>
                    </span>
                  </a>
                </li>
                <li>
                  <a href={`tel:${SITE.germany.phone}`}>
                    <span className="ci">
                      <Phone />
                    </span>
                    <span>
                      <small>{t.common.callUs}</small>
                      <strong>{SITE.germany.phoneDisplay}</strong>
                    </span>
                  </a>
                </li>
                <li>
                  <a href={SITE.germany.url} target="_blank" rel="noopener noreferrer">
                    <span className="ci">
                      <Globe />
                    </span>
                    <span>
                      <small>Web</small>
                      <strong>{SITE.germany.urlDisplay}</strong>
                    </span>
                  </a>
                </li>
              </ul>
              <p className="note">{l.de.note}</p>
              <div>
                <a href={SITE.germany.url} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                  {l.de.cta} <ArrowUpRight />
                </a>
              </div>
            </RevealItem>
          </RevealList>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container split">
          <div className="split-copy">
            <SectionHead title={l.expandTitle} text={l.expandText} />
            <Reveal>
              <p className="note">{l.expandNote}</p>
            </Reveal>
          </div>
          <Media src={IMG.exterior2} alt={l.imageAlt} tall />
        </div>
      </section>

      <CtaBand locale={locale} t={t} title={l.bottomTitle} />
    </>
  )
}

const WORK_ICONS = [Sliders, Chat, Doc, Expand]

export function AboutPage({ locale, t }: ViewProps) {
  const a = t.about
  const numberLocale = locale === 'en' ? 'en-GB' : 'tr-TR'
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: a.eyebrow }]} eyebrow={a.eyebrow} title={a.title} lead={a.intro} image={IMG.exterior1} imageAlt={a.imageAlt} imageTag="Hinckley · Leicestershire">
        <div className="btn-row">
          <Link href={href(locale, 'quote')} className="btn btn-primary">
            {t.common.getFulfilmentQuote} <ArrowRight />
          </Link>
        </div>
      </PageHero>

      <section className="section section-white">
        <div className="container split split-top">
          <SectionHead title={a.focusTitle} text={a.focusText} />
          <div className="split-copy">
            <SectionHead title={a.germanyTitle} text={a.germanyText} />
            <Reveal>
              <p className="note">{a.germanyNote}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="split-copy">
            <SectionHead title={a.scaleTitle} text={a.scaleText} />
            <Reveal className="stats">
              {t.home.growth.stats.map((s) => (
                <div key={s.label} className="stat">
                  <div className="stat-value">
                    <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} locale={numberLocale} />
                  </div>
                  <p>{s.label}</p>
                </div>
              ))}
            </Reveal>
            <Reveal className="capacity" aria-hidden="true">
              <div className="capacity-bar">
                <GrowBar to={20} />
              </div>
              <div className="capacity-legend">
                <span>~200 m²</span>
                <span>~1,000 m² · 2026</span>
              </div>
            </Reveal>
          </div>
          <Media src={IMG.shelving} alt={t.home.hero.imageAlt} tall />
        </div>
      </section>

      <section className="section section-paper2">
        <div className="container">
          <SectionHead title={a.workTitle} />
          <RevealList className="grid-4">
            {a.work.map((w, i) => {
              const Icon = WORK_ICONS[i]
              return (
                <RevealItem key={w.title} className="card">
                  <span className="card-icon">
                    <Icon size={24} />
                  </span>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </RevealItem>
              )
            })}
          </RevealList>
        </div>
      </section>

      <section className="section">
        <div className="container split split-top">
          <SectionHead title={a.detailsTitle} />
          <Reveal className="label-card" style={{ padding: 32 }}>
            <dl className="dl">
              <dt>{a.details.entity}</dt>
              <dd>{SITE.legalName}</dd>
              <dt>{a.details.companyNo}</dt>
              <dd>{SITE.companyNo}</dd>
              <dt>{a.details.vat}</dt>
              <dd>{SITE.vat}</dd>
              <dt>{a.details.eori}</dt>
              <dd>{SITE.eori}</dd>
            </dl>
          </Reveal>
        </div>
      </section>

      <CtaBand locale={locale} t={t} title={t.common.getFulfilmentQuote} />
    </>
  )
}
