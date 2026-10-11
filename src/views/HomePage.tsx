import Link from 'next/link'
import { HeroScroll } from '@/components/hero/HeroScroll'
import { Counter, GrowBar, Reveal, RevealItem, RevealList } from '@/components/Motion'
import { ChannelGrid, IMG, Media, SectionHead, ServiceGrid } from '@/components/ui'
import { ArrowRight, Bolt, Chat, CheckCircle, Cpu, Expand, Pin, Returns, Sliders, Target, Check, WhatsApp } from '@/components/Icons'
import { href } from '@/lib/routes'
import { SITE, whatsappLink } from '@/lib/site'
import type { ViewProps } from './render'

const WHY_ICONS = [Sliders, Pin, Target, Chat, Returns, Expand]

export function HomePage({ locale, t }: ViewProps) {
  const h = t.home
  const numberLocale = locale === 'en' ? 'en-GB' : 'tr-TR'
  return (
    <>
      <HeroScroll
        eyebrow={h.hero.eyebrow}
        heading={h.hero.title}
        text={h.hero.text}
        steps={h.story}
        labels={{ cities: h.cities, hinckley: `${h.cities.hinckley} · Depoxpress UK` }}
        fallbackImage={IMG.dispatch}
        fallbackAlt={h.hero.imageAlt}
        scrollLabel={t.common.scroll}
      >
        <ul className="hero-trust">
          {h.hero.trust.map((x) => (
            <li key={x}>
              <CheckCircle />
              {x}
            </li>
          ))}
        </ul>
        <div className="btn-row">
          <Link href={href(locale, 'quote')} className="btn btn-primary">
            {t.common.getFulfilmentQuote} <ArrowRight />
          </Link>
          <Link href={href(locale, 'contact')} className="btn btn-ghost">
            {t.common.talkToTeam}
          </Link>
        </div>
      </HeroScroll>

      {/* ---------- Company badges ---------- */}
      <div className="marquee" aria-label={h.badges.join(', ')}>
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map((k) => (
            <ul key={k}>
              {[...h.badges, ...h.badges].map((b, i) => (
                <li key={`${k}${i}`}>
                  <Check size={16} />
                  {b}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* ---------- Services ---------- */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-head-row">
            <SectionHead eyebrow={h.services.eyebrow} title={h.services.title} text={h.services.text} />
            <Reveal>
              <Link href={href(locale, 'services')} className="text-link">
                {h.services.viewAll} <ArrowRight />
              </Link>
            </Reveal>
          </div>
          <ServiceGrid locale={locale} t={t} ids={['ecommerce', 'warehousing', 'fbaPrep', 'fbm', 'returns', 'kitting']} />
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section section-dark">
        <div className="container">
          <SectionHead eyebrow={h.how.eyebrow} title={h.how.title} text={h.how.text} />
          <RevealList as="ol" className="steps process">
            {h.how.steps.map((s, i) => (
              <RevealItem key={s.title} className="step">
                <span className="step-no">
                  <b>{i + 1}</b>
                  {t.common.stepLabel} {i + 1}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </RevealItem>
            ))}
          </RevealList>
          <Reveal style={{ marginTop: 32 }}>
            <Link href={href(locale, 'howItWorks')} className="text-link">
              {h.how.cta} <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- Sales channels ---------- */}
      <section className="section">
        <div className="container stack-md">
          <SectionHead eyebrow={h.channels.eyebrow} title={h.channels.title} text={h.channels.text} />
          <ChannelGrid t={t} />
          <Reveal className="stack-md">
            <p className="note">{h.channels.note}</p>
            <Link href={href(locale, 'integrations')} className="text-link">
              {h.channels.cta} <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- Why ---------- */}
      <section className="section section-paper2">
        <div className="container">
          <SectionHead eyebrow={h.why.eyebrow} title={h.why.title} text={h.why.text} />
          <RevealList className="grid-3">
            {h.why.items.map((w, i) => {
              const Icon = WHY_ICONS[i] ?? Bolt
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

      {/* ---------- Technology ---------- */}
      <section className="section">
        <div className="container split split-top">
          <div className="split-copy">
            <SectionHead eyebrow={h.tech.eyebrow} title={h.tech.title} text={h.tech.text} />
            <Reveal>
              <ul className="chip-list">
                {h.tech.capabilities.map((c) => (
                  <li key={c} className="chip">
                    <Cpu size={16} />
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div className="stack-md">
            <RevealList className="grid-2">
              {[
                ['JTL', h.tech.jtl],
                ['FFN', h.tech.ffn],
              ].map(([name, text]) => (
                <RevealItem key={name} className="label-card">
                  <span className="barcode" />
                  <h3 style={{ fontSize: 34, fontStretch: '120%' }}>{name}</h3>
                  <p style={{ color: 'var(--muted)' }}>{text}</p>
                </RevealItem>
              ))}
            </RevealList>
            <Reveal className="stack-md">
              <p className="note">{h.tech.note}</p>
              <Link href={href(locale, 'technology')} className="text-link">
                {h.tech.cta} <ArrowRight />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- UK growth ---------- */}
      <section className="section section-white">
        <div className="container split">
          <Media src={IMG.clipboard} alt={h.growth.imageAlt} tag="Hinckley · LE10" />
          <div className="split-copy">
            <SectionHead eyebrow={h.growth.eyebrow} title={h.growth.title} text={h.growth.text} />
            <Reveal className="stats">
              {h.growth.stats.map((s) => (
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
        </div>
      </section>

      {/* ---------- Germany & UK ---------- */}
      <section className="section">
        <div className="container split split-top">
          <div className="split-copy">
            <SectionHead eyebrow={h.germany.eyebrow} title={h.germany.title} text={h.germany.text} />
          </div>
          <div className="stack-md">
            <RevealList className="two-loc">
              <RevealItem className="loc-mini">
                <span className="flag" aria-hidden="true">
                  🇩🇪
                </span>
                <h3>{h.germany.deTitle}</h3>
                <p>{h.germany.deText}</p>
              </RevealItem>
              <RevealItem className="loc-mini">
                <span className="flag" aria-hidden="true">
                  🇬🇧
                </span>
                <h3>{h.germany.ukTitle}</h3>
                <p>{h.germany.ukText}</p>
              </RevealItem>
            </RevealList>
            <Reveal className="stack-md">
              <p className="note">{h.germany.note}</p>
              <div className="btn-row">
                <a href={SITE.germany.url} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                  {h.germany.visit}
                </a>
                <Link href={href(locale, 'locations')} className="btn btn-dark">
                  {h.germany.locations} <ArrowRight />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Amazon UK ---------- */}
      <section className="section section-dark">
        <div className="container split">
          <div className="split-copy">
            <SectionHead eyebrow={h.amazon.eyebrow} title={h.amazon.title} text={h.amazon.text} />
            <RevealList className="amazon-list">
              {h.amazon.items.map((it) => (
                <RevealItem key={it}>
                  <Check size={18} />
                  {it}
                </RevealItem>
              ))}
            </RevealList>
            <Reveal className="stack-md">
              <p className="note">{h.amazon.note}</p>
              <div>
                <Link href={href(locale, 'quote')} className="btn btn-primary">
                  {h.amazon.cta} <ArrowRight />
                </Link>
              </div>
            </Reveal>
          </div>
          <Media src={IMG.labelled} alt={h.amazon.imageAlt} tall tag="FNSKU · FBA" />
        </div>
      </section>

      {/* ---------- UK returns ---------- */}
      <section className="section">
        <div className="container split">
          <Media src={IMG.organising} alt={h.returns.imageAlt} tall />
          <div className="split-copy">
            <SectionHead eyebrow={h.returns.eyebrow} title={h.returns.title} text={h.returns.text} />
            <Reveal>
              <Link href={href(locale, 'contact')} className="btn btn-dark">
                {h.returns.cta} <ArrowRight />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="cta-band">
            <div>
              <h2>{h.cta.title}</h2>
              <p>{h.cta.text}</p>
            </div>
            <div className="btn-row">
              <Link href={href(locale, 'quote')} className="btn btn-primary">
                {t.common.requestQuote} <ArrowRight />
              </Link>
              <a href={whatsappLink(t.common.whatsappMessage)} className="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
                <WhatsApp size={18} /> {t.common.messageUs}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
