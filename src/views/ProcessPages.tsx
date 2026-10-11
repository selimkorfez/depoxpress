import Link from 'next/link'
import { CheckList, CtaBand, IMG, Media, PageHero, SectionHead, SERVICE_ICON } from '@/components/ui'
import { Reveal, RevealItem, RevealList } from '@/components/Motion'
import { ArrowRight, Check, Plus, Store, Globe, Building, Parcel } from '@/components/Icons'
import { href } from '@/lib/routes'
import type { ViewProps } from './render'

const SOLUTION_ICONS = [Store, Parcel, Globe, Building]

export function SolutionsPage({ locale, t }: ViewProps) {
  const s = t.solutions
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: s.eyebrow }]} eyebrow={s.eyebrow} title={s.title} lead={s.intro} image={IMG.dispatch} imageAlt={t.home.hero.imageAlt}>
        <div className="btn-row">
          <Link href={href(locale, 'quote')} className="btn btn-primary">
            {t.common.getFulfilmentQuote} <ArrowRight />
          </Link>
        </div>
      </PageHero>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="sr-only">{s.title}</h2>
          <RevealList className="grid-2">
            {s.items.map((it, i) => {
              const Icon = SOLUTION_ICONS[i]
              return (
                <RevealItem key={it.title} className="card" >
                  <span className="card-icon">
                    <Icon size={24} />
                  </span>
                  <h3 style={{ fontSize: 24 }}>{it.title}</h3>
                  <p>{it.text}</p>
                  <ul className="chip-list" style={{ marginTop: 8 }}>
                    {it.services.map((id) => {
                      const SIcon = SERVICE_ICON[id]
                      return (
                        <li key={id}>
                          <Link href={href(locale, `service:${id}`)} className="chip" style={{ textDecoration: 'none', color: 'var(--ink)' }}>
                            <SIcon size={16} />
                            {t.services[id].title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </RevealItem>
              )
            })}
          </RevealList>
        </div>
      </section>
      <CtaBand locale={locale} t={t} title={s.bottom} primary={t.common.getFulfilmentQuote} />
    </>
  )
}

export function HowItWorksPage({ locale, t }: ViewProps) {
  const h = t.howItWorks
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: h.eyebrow }]} eyebrow={h.eyebrow} title={h.title} lead={h.intro}>
        <div className="btn-row">
          <Link href={href(locale, 'quote')} className="btn btn-primary">
            {t.common.getFulfilmentQuote} <ArrowRight />
          </Link>
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="sr-only">{h.title}</h2>
          <RevealList as="ol" className="grid-4 process" >
            {h.steps.map((s, i) => (
              <RevealItem key={s.title} className="step">
                <span className="step-no">
                  <b>{i + 1}</b>
                  {t.common.stepLabel} {i + 1}
                </span>
                <h3>{s.title}</h3>
                <p>{s.lead}</p>
                <ul className="check-list" style={{ fontSize: 15, marginTop: 6 }}>
                  {s.points.map((pt) => (
                    <li key={pt}>
                      <Check size={18} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </RevealList>
        </div>
      </section>

      <section className="section section-white">
        <div className="container split">
          <div className="split-copy">
            <SectionHead title={h.needTitle} />
            <CheckList items={h.need} />
          </div>
          <Media src={IMG.scanner} alt="" />
        </div>
      </section>

      <section className="section">
        <div className="container split split-top">
          <SectionHead title={h.faqTitle} />
          <Reveal className="faq">
            {h.faqs.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <Plus />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand locale={locale} t={t} title={t.common.getFulfilmentQuote} />
    </>
  )
}
