import Link from 'next/link'
import { CheckList, CtaBand, PageHero, SectionHead, SERVICE_IMAGE, ServiceGrid, Steps } from '@/components/ui'
import { Reveal, RevealItem, RevealList } from '@/components/Motion'
import { ArrowRight, Target } from '@/components/Icons'
import { href, SERVICE_IDS, type ServiceId } from '@/lib/routes'
import type { ViewProps } from './render'

export function ServicesPage({ locale, t }: ViewProps) {
  const s = t.servicesPage
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: s.eyebrow }]} eyebrow={s.eyebrow} title={s.title} lead={s.intro}>
        <div className="btn-row">
          <Link href={href(locale, 'quote')} className="btn btn-primary">
            {t.common.getFulfilmentQuote} <ArrowRight />
          </Link>
        </div>
      </PageHero>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="sr-only">{s.title}</h2>
          <ServiceGrid locale={locale} t={t} ids={[...SERVICE_IDS]} cols="grid-4" />
        </div>
      </section>
      <CtaBand locale={locale} t={t} title={s.bottom} primary={t.common.getFulfilmentQuote} />
    </>
  )
}

export function ServicePage({ locale, t, id }: ViewProps & { id: ServiceId }) {
  const s = t.services[id]
  const related = SERVICE_IDS.filter((x) => x !== id).slice(0, 3)
  const isFba = id === 'fbaPrep'
  return (
    <>
      <PageHero
        locale={locale}
        t={t}
        crumbs={[{ label: t.common.allServices, key: 'services' }, { label: s.title }]}
        eyebrow={t.nav.services}
        title={s.title}
        lead={s.intro}
        image={SERVICE_IMAGE[id]}
        imageAlt=""
        imageTag="Hinckley · Leicestershire"
      >
        <div className="btn-row">
          <Link href={href(locale, 'quote')} className="btn btn-primary">
            {s.cta} <ArrowRight />
          </Link>
          <Link href={href(locale, 'contact')} className="btn btn-ghost">
            {t.common.talkToTeam}
          </Link>
        </div>
      </PageHero>

      <section className="section section-white">
        <div className="container split split-top">
          <div className="split-copy">
            <SectionHead title={s.includedTitle} />
          </div>
          <CheckList items={s.included} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead title={s.howTitle} />
          <Steps t={t} steps={s.steps} process={s.steps.length <= 5} />
        </div>
      </section>

      <section className="section section-dark">
        <div className="container split split-top">
          <SectionHead title={s.suitedTitle} />
          <div className="stack-md">
            <RevealList className="grid-2">
              {s.suited.map((x) => (
                <RevealItem key={x} className="card">
                  <span className="card-icon">
                    <Target size={22} />
                  </span>
                  <h3 style={{ fontSize: 18 }}>{x}</h3>
                </RevealItem>
              ))}
            </RevealList>
            {s.note ? (
              <Reveal>
                <p className="note">{s.note}</p>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow={t.nav.services} title={t.common.allServices} />
          <ServiceGrid locale={locale} t={t} ids={related} />
        </div>
      </section>

      <CtaBand locale={locale} t={t} title={s.quoteTitle} primary={isFba ? s.cta : t.common.getFulfilmentQuote} />
    </>
  )
}
