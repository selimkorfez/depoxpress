import { ContactPanel } from '@/components/forms/ContactPanel'
import { QuoteForm } from '@/components/forms/Forms'
import { ContactList, PageHero } from '@/components/ui'
import { Reveal } from '@/components/Motion'
import { WhatsApp } from '@/components/Icons'
import { href } from '@/lib/routes'
import { SITE, mapsEmbed, whatsappLink } from '@/lib/site'
import type { ViewProps } from './render'

export function ContactPage({ locale, t }: ViewProps) {
  const c = t.contact
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: c.eyebrow }]} eyebrow={c.eyebrow} title={c.title} lead={c.intro} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container stack-lg">
          <ContactPanel t={{ contact: t.contact, form: t.form, common: t.common, footer: t.footer }} locale={locale} privacyHref={href(locale, 'privacy')} />
          <Reveal className="map-frame">
            <iframe title={c.mapTitle} src={mapsEmbed()} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </Reveal>
        </div>
      </section>
    </>
  )
}

export function QuotePage({ locale, t }: ViewProps) {
  const q = t.quote
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: q.eyebrow }]} eyebrow={q.eyebrow} title={q.title} lead={q.intro}>
        <p className="field-hint">
          {q.talkFirst}{' '}
          <a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a> ·{' '}
          <a href={whatsappLink(t.common.whatsappMessage)} target="_blank" rel="noopener noreferrer">
            {t.common.whatsapp}
          </a>
        </p>
      </PageHero>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container split split-top quote-grid">
          <div className="form-card">
            <QuoteForm f={t.form} locale={locale} privacyHref={href(locale, 'privacy')} privacyLabel={t.footer.privacy} />
          </div>
          <aside className="aside-stack">
            <div className="label-card">
              <h2 style={{ fontSize: 22 }}>{q.nextTitle}</h2>
              <ol className="next-steps">
                {q.next.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ol>
              <p className="field-hint">{t.form.noObligation}</p>
            </div>
            <div className="location-card">
              <h2 style={{ fontSize: 22 }}>{q.talkFirst}</h2>
              <ContactList t={t} />
              <a className="btn btn-whatsapp" href={whatsappLink(t.common.whatsappMessage)} target="_blank" rel="noopener noreferrer">
                <WhatsApp size={18} /> {t.common.messageUs}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
