import Link from 'next/link'
import Image from 'next/image'
import type { Dict } from '@/content'
import { href, SERVICE_IDS, type Locale, type PageKey, type ServiceId } from '@/lib/routes'
import { SITE, whatsappLink } from '@/lib/site'
import { Reveal, RevealItem, RevealList } from './Motion'
import { ArrowRight, Barcode, Building, Check, Hand, Layers, Mail, Parcel, Phone, Returns, Truck, Warehouse, WhatsApp } from './Icons'

export const SERVICE_ICON: Record<ServiceId, (p: { size?: number }) => React.ReactNode> = {
  ecommerce: Parcel,
  warehousing: Warehouse,
  fbaPrep: Barcode,
  fbm: Truck,
  returns: Returns,
  kitting: Layers,
  pickPack: Hand,
  b2b: Building,
}

export const IMG = {
  shelving: '/images/stock/uk-fulfilment-warehouse-storage-shelving.jpg',
  scanner: '/images/stock/warehouse-order-scanning-handheld-scanner.jpg',
  tape: '/images/stock/pick-and-pack-sealing-parcel-with-tape.jpg',
  dispatch: '/images/stock/parcels-ready-for-dispatch.jpg',
  clipboard: '/images/stock/warehouse-team-order-check-clipboard.jpg',
  labelled: '/images/stock/packed-order-labelled-parcel.jpg',
  organising: '/images/stock/warehouse-operative-organising-parcels-on-shelf.jpg',
  exterior1: '/images/warehouse/davenport-business-centre-hinckley-exterior-01.jpg',
  exterior2: '/images/warehouse/davenport-business-centre-hinckley-exterior-02.jpg',
}

export const SERVICE_IMAGE: Record<ServiceId, string> = {
  ecommerce: IMG.tape,
  warehousing: IMG.shelving,
  fbaPrep: IMG.scanner,
  fbm: IMG.dispatch,
  returns: IMG.organising,
  kitting: IMG.labelled,
  pickPack: IMG.tape,
  b2b: IMG.clipboard,
}

/* ---------- Breadcrumbs ---------- */
export function Breadcrumbs({ locale, t, items }: { locale: Locale; t: Dict; items: { label: string; key?: PageKey }[] }) {
  return (
    <nav className="breadcrumbs" aria-label={t.common.breadcrumb}>
      <ol>
        <li>
          <Link href={href(locale, 'home')}>{t.common.home}</Link>
        </li>
        {items.map((it, i) => (
          <li key={i}>{it.key && i < items.length - 1 ? <Link href={href(locale, it.key)}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}</li>
        ))}
      </ol>
    </nav>
  )
}

/* ---------- Page hero ---------- */
export function PageHero({
  locale,
  t,
  crumbs,
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  imageTag,
  children,
}: {
  locale: Locale
  t: Dict
  crumbs: { label: string; key?: PageKey }[]
  eyebrow: string
  title: string
  lead?: string
  image?: string
  imageAlt?: string
  imageTag?: string
  children?: React.ReactNode
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <Breadcrumbs locale={locale} t={t} items={crumbs} />
        <div className={`page-hero-grid${image ? '' : ' no-media'}`}>
          <Reveal className="page-hero-copy">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {lead ? <p className="lead">{lead}</p> : null}
            {children}
          </Reveal>
          {image ? (
            <Reveal delay={0.1}>
              <figure className="media">
                <Image src={image} alt={imageAlt ?? ''} fill sizes="(max-width: 900px) 100vw, 40vw" priority style={{ objectFit: 'cover' }} />
                {imageTag ? <figcaption className="media-tag">{imageTag}</figcaption> : null}
              </figure>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/* ---------- Section heading ---------- */
export function SectionHead({ eyebrow, title, text, children, id }: { eyebrow?: string; title: string; text?: string; children?: React.ReactNode; id?: string }) {
  return (
    <Reveal className="section-head">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={id}>{title}</h2>
      {text ? <p>{text}</p> : null}
      {children}
    </Reveal>
  )
}

/* ---------- CTA band ---------- */
export function CtaBand({ locale, t, title, text, primary, primaryKey = 'quote' }: { locale: Locale; t: Dict; title: string; text?: string; primary?: string; primaryKey?: PageKey }) {
  return (
    <section className="section-tight">
      <div className="container">
        <Reveal className="cta-band">
          <div>
            <h2>{title}</h2>
            {text ? <p>{text}</p> : null}
          </div>
          <div className="btn-row">
            <Link href={href(locale, primaryKey)} className="btn btn-primary">
              {primary ?? t.common.requestQuote} <ArrowRight />
            </Link>
            <Link href={href(locale, 'contact')} className="btn btn-ghost">
              {t.common.talkToTeam}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Service cards ---------- */
export function ServiceGrid({ locale, t, ids = [...SERVICE_IDS], cols = 'grid-3' }: { locale: Locale; t: Dict; ids?: ServiceId[]; cols?: string }) {
  return (
    <RevealList className={cols}>
      {ids.map((id) => {
        const s = t.services[id]
        const Icon = SERVICE_ICON[id]
        return (
          <RevealItem key={id} className="card card-link">
            <span className="card-icon">
              <Icon size={24} />
            </span>
            <h3>
              <Link href={href(locale, `service:${id}`)}>{s.title}</Link>
            </h3>
            <p>{s.short}</p>
            <span className="card-more" aria-hidden="true">
              {t.common.readMore} <ArrowRight size={16} />
            </span>
          </RevealItem>
        )
      })}
    </RevealList>
  )
}

/* ---------- Check list ---------- */
export function CheckList({ items }: { items: string[] }) {
  return (
    <RevealList className="check-list">
      {items.map((it) => (
        <RevealItem key={it}>
          <Check />
          <span>{it}</span>
        </RevealItem>
      ))}
    </RevealList>
  )
}

/* ---------- Numbered steps ---------- */
export function Steps({ t, steps, process = true }: { t: Dict; steps: { title: string; text: string }[]; process?: boolean }) {
  return (
    <RevealList as="ol" className={`steps${process ? ' process' : ''}`}>
      {steps.map((s, i) => (
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
  )
}

/* ---------- Contact methods ---------- */
export function ContactList({ t }: { t: Dict }) {
  return (
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
        <a href={`tel:${SITE.phone}`}>
          <span className="ci">
            <Phone />
          </span>
          <span>
            <small>{t.common.callUs}</small>
            <strong>{SITE.phoneDisplay}</strong>
          </span>
        </a>
      </li>
      <li>
        <a href={whatsappLink(t.common.whatsappMessage)} target="_blank" rel="noopener noreferrer">
          <span className="ci">
            <WhatsApp size={20} />
          </span>
          <span>
            <small>{t.common.whatsapp}</small>
            <strong>{SITE.phoneDisplay}</strong>
          </span>
        </a>
      </li>
    </ul>
  )
}

/* ---------- Sales channels ---------- */
export const CHANNELS: { name: string; logo?: string; kind: 'marketplace' | 'shop' }[] = [
  { name: 'Amazon', kind: 'marketplace' },
  { name: 'eBay', logo: '/logos/ebay.svg', kind: 'marketplace' },
  { name: 'Kaufland', logo: '/logos/kaufland.svg', kind: 'marketplace' },
  { name: 'OTTO', logo: '/logos/otto.svg', kind: 'marketplace' },
  { name: 'TikTok Shop', logo: '/logos/tiktok.svg', kind: 'marketplace' },
  { name: 'Etsy', logo: '/logos/etsy.svg', kind: 'marketplace' },
  { name: 'Shopify', logo: '/logos/shopify.svg', kind: 'shop' },
  { name: 'WooCommerce', logo: '/logos/woocommerce.svg', kind: 'shop' },
  { name: 'Shopware', logo: '/logos/shopware.svg', kind: 'shop' },
  { name: 'PrestaShop', logo: '/logos/prestashop.svg', kind: 'shop' },
  { name: 'Squarespace', logo: '/logos/squarespace.svg', kind: 'shop' },
  { name: 'Gambio', kind: 'shop' },
]

/** The six channels the UK operation supports today. */
export const UK_CHANNELS = ['Amazon', 'eBay', 'Shopify', 'TikTok Shop', 'WooCommerce', 'Etsy']

function ChannelLogo({ name, logo }: { name: string; logo?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return logo ? <img src={logo} alt="" width={30} height={30} /> : <span className="channel-mono">{name[0]}</span>
}

export function ChannelGrid({ t, names = UK_CHANNELS, tag }: { t: Dict; names?: string[]; tag?: string }) {
  return (
    <RevealList className="channels">
      {names.map((n) => {
        const c = CHANNELS.find((c) => c.name === n)
        return (
          <RevealItem key={n} className="channel">
            <ChannelLogo name={n} logo={c?.logo} />
            <span>{n}</span>
            {tag ? <span className="tag">{tag}</span> : <small>{c?.kind === 'shop' ? t.ecosystem.shopSystem : t.ecosystem.marketplace}</small>}
          </RevealItem>
        )
      })}
    </RevealList>
  )
}

/* ---------- Ecosystem: channels → JTL/FFN layer → operations ---------- */
export function Ecosystem({ t }: { t: Dict }) {
  const e = t.ecosystem
  const flow = (
    <svg className="eco-flow" viewBox="0 0 60 12" aria-hidden="true">
      <line x1="0" y1="6" x2="60" y2="6" />
    </svg>
  )
  return (
    <div>
      <Reveal className="eco">
        <div className="eco-col">
          <h3>{e.channelsLabel}</h3>
          <ul className="eco-logos">
            {CHANNELS.map((c) => (
              <li key={c.name}>
                <ChannelLogo name={c.name} logo={c.logo} />
                <span>
                  {c.name}
                  <small>{c.kind === 'shop' ? e.shopSystem : e.marketplace}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
        {flow}
        <div className="eco-core">
          <span className="mono">Depoxpress</span>
          <strong>{e.layerLabel}</strong>
          <span className="mono">JTL + FFN</span>
          <ul className="chip-list">
            {e.layerTags.map((tg) => (
              <li key={tg} className="chip">
                {tg}
              </li>
            ))}
          </ul>
        </div>
        {flow}
        <div className="eco-col">
          <h3>{e.opsLabel}</h3>
          <ul className="eco-ops">
            {e.ops.map((o) => (
              <li key={o}>
                <Check size={16} />
                {o}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
      <p className="eco-caption">{e.caption}</p>
    </div>
  )
}

/* ---------- Media ---------- */
export function Media({ src, alt, tall, tag, sizes = '(max-width: 900px) 100vw, 45vw' }: { src: string; alt: string; tall?: boolean; tag?: string; sizes?: string }) {
  return (
    <Reveal>
      <figure className={`media${tall ? ' media-tall' : ''}`}>
        <Image src={src} alt={alt} fill sizes={sizes} style={{ objectFit: 'cover' }} />
        {tag ? <figcaption className="media-tag">{tag}</figcaption> : null}
      </figure>
    </Reveal>
  )
}
