import Link from 'next/link'
import { CheckList, CtaBand, PageHero, SectionHead } from '@/components/ui'
import { Reveal, RevealItem, RevealList } from '@/components/Motion'
import { ArrowRight, Barcode, Layers, Parcel, Returns, Truck, Warehouse, Hand } from '@/components/Icons'
import { href } from '@/lib/routes'
import type { ViewProps } from './render'

const CAT_ICONS = [Warehouse, Parcel, Hand, Truck, Returns, Barcode, Layers]

export function PricingPage({ locale, t }: ViewProps) {
  const p = t.pricing
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: p.eyebrow }]} eyebrow={p.eyebrow} title={p.title} lead={p.intro}>
        <div className="btn-row">
          <Link href={href(locale, 'quote')} className="btn btn-primary">
            {p.cta} <ArrowRight />
          </Link>
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHead title={p.categoriesTitle} text={p.categoriesText} />
          <RevealList className="grid-4">
            {p.categories.map((c, i) => {
              const Icon = CAT_ICONS[i]
              return (
                <RevealItem key={c.title} className="card">
                  <span className="card-icon">
                    <Icon size={24} />
                  </span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </RevealItem>
              )
            })}
          </RevealList>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container split split-top">
          <div className="split-copy">
            <SectionHead title={p.buildTitle} text={p.buildText} />
            <RevealList as="ol" className="cost-build">
              {p.build.map((b) => (
                <RevealItem key={b}>
                  <span>{b}</span>
                </RevealItem>
              ))}
            </RevealList>
          </div>
          <div className="split-copy">
            <Reveal>
              <h3 style={{ fontSize: 24, marginBottom: 18 }}>{p.affectsTitle}</h3>
            </Reveal>
            <CheckList items={p.affects} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead title={p.rmTitle} text={p.rmText}>
            <div>
              <span className="ref-pill">
                {p.refLabel} · {p.refDate}
              </span>
            </div>
          </SectionHead>
          <Reveal className="stack-md" style={{ marginBottom: 28 }}>
            <p className="note">{p.refNote}</p>
            <p className="note">{p.surchargeNote}</p>
          </Reveal>
          <RevealList className="grid-2">
            {p.tables.map((tb) => (
              <RevealItem key={tb.title} className="label-card">
                <h3 style={{ fontSize: 24 }}>{tb.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 15 }}>{tb.text}</p>
                <table className="rate-table">
                  <caption className="sr-only">
                    {tb.title} — {p.refLabel}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">{p.formatCol}</th>
                      <th scope="col">{p.fromCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tb.rows.map(([f, price]) => (
                      <tr key={f}>
                        <td>{f}</td>
                        <td>{price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <span className="ref-pill" style={{ justifySelf: 'start' }}>
                  {p.referenceOnly}
                </span>
              </RevealItem>
            ))}
          </RevealList>
        </div>
      </section>

      <CtaBand locale={locale} t={t} title={p.bottomTitle} text={p.bottomText} primary={p.cta} />
    </>
  )
}
