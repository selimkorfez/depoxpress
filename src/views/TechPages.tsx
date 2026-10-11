import Link from 'next/link'
import { ChannelGrid, CtaBand, Ecosystem, IMG, Media, PageHero, SectionHead, Steps, UK_CHANNELS } from '@/components/ui'
import { Reveal, RevealItem, RevealList } from '@/components/Motion'
import { ArrowRight, Cross, Cpu, Doc, Layers, Returns, Sliders, Target } from '@/components/Icons'
import { href } from '@/lib/routes'
import type { ViewProps } from './render'

const EASIER_ICONS = [Target, Cpu, Sliders, Layers, Returns, Doc]

export function TechnologyPage({ locale, t }: ViewProps) {
  const x = t.technology
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: x.eyebrow }]} eyebrow={x.eyebrow} title={x.title} lead={x.intro} image={IMG.scanner} imageAlt="" imageTag="JTL · FFN" />

      <section className="section section-white">
        <div className="container">
          <div className="split split-top">
            <SectionHead eyebrow={x.ffnEyebrow} title={x.ffnTitle} text={x.ffnText} />
            <RevealList className="grid-2">
              {[
                ['JTL', t.home.tech.jtl],
                ['FFN', t.home.tech.ffn],
              ].map(([name, text]) => (
                <RevealItem key={name} className="label-card">
                  <span className="barcode" />
                  <h3 style={{ fontSize: 34, fontStretch: '120%' }}>{name}</h3>
                  <p style={{ color: 'var(--muted)' }}>{text}</p>
                </RevealItem>
              ))}
            </RevealList>
          </div>
          <RevealList className="grid-4" >
            {x.points.map((p, i) => (
              <RevealItem key={p.title} className="card">
                <span className="mono" style={{ color: 'var(--signal)', fontWeight: 600 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </RevealItem>
            ))}
          </RevealList>
          <Reveal style={{ marginTop: 28 }}>
            <p className="note">{x.systemsNote}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow={x.flowEyebrow} title={x.flowTitle} text={x.flowText} />
          <Steps t={t} steps={x.flow} />
        </div>
      </section>

      <section className="section section-paper2">
        <div className="container">
          <SectionHead eyebrow={x.easierEyebrow} title={x.easierTitle} text={x.easierText} />
          <RevealList className="grid-3">
            {x.easier.map((e, i) => {
              const Icon = EASIER_ICONS[i]
              return (
                <RevealItem key={e.title} className="card">
                  <span className="card-icon">
                    <Icon size={24} />
                  </span>
                  <h3>{e.title}</h3>
                  <p>{e.text}</p>
                </RevealItem>
              )
            })}
          </RevealList>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container stack-md">
          <SectionHead eyebrow={x.platformsEyebrow} title={x.platformsTitle} text={x.platformsText} />
          <Ecosystem t={t} />
          <Reveal className="stack-md">
            <p className="note">{t.ecosystem.note}</p>
            <p className="note">{x.platformsNote}</p>
            <Link href={href(locale, 'integrations')} className="text-link">
              {x.platformsCta} <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <Media src={IMG.organising} alt={t.home.returns.imageAlt} tall />
          <div className="split-copy">
            <SectionHead title={x.floorTitle} text={x.floorText} />
            <Reveal className="stack-md">
              <h3>{x.notTitle}</h3>
              <p style={{ color: 'var(--muted)' }}>{x.notText}</p>
              <ul className="not-list">
                {x.not.map((n) => (
                  <li key={n}>
                    <Cross size={16} />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand locale={locale} t={t} title={t.common.getFulfilmentQuote} />
    </>
  )
}

export function IntegrationsPage({ locale, t }: ViewProps) {
  const x = t.integrations
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: x.eyebrow }]} eyebrow={x.eyebrow} title={x.title} lead={x.intro} />

      <section className="section section-white">
        <div className="container split split-top">
          <SectionHead title={x.systemsTitle} text={x.systemsText} />
          <RevealList className="grid-2">
            {[
              ['JTL', t.home.tech.jtl],
              ['FFN', t.home.tech.ffn],
            ].map(([name, text]) => (
              <RevealItem key={name} className="label-card">
                <span className="barcode" />
                <h3 style={{ fontSize: 34, fontStretch: '120%' }}>{name}</h3>
                <p style={{ color: 'var(--muted)' }}>{text}</p>
              </RevealItem>
            ))}
          </RevealList>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container stack-md">
          <SectionHead eyebrow={x.howEyebrow} title={t.ecosystem.title} text={t.ecosystem.text} />
          <Ecosystem t={t} />
          <Reveal>
            <p className="note">{t.ecosystem.note}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container stack-md">
          <SectionHead title={x.channelsTitle} text={x.channelsText} />
          <ChannelGrid t={t} names={UK_CHANNELS} tag={x.supported} />
          <Reveal>
            <p className="note">{x.channelsNote}</p>
          </Reveal>
        </div>
      </section>

      <section className="section section-white">
        <div className="container split split-top">
          <SectionHead title={x.definitionsTitle} />
          <RevealList className="grid-2">
            {x.definitions.map((d) => (
              <RevealItem key={d.title} className="card">
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </RevealItem>
            ))}
          </RevealList>
        </div>
      </section>

      <CtaBand locale={locale} t={t} title={t.common.getFulfilmentQuote} />
    </>
  )
}
