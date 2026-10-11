'use client'

import { useState } from 'react'
import type { Dict } from '@/content'
import type { Locale } from '@/lib/routes'
import { SITE, mapsLink, whatsappLink } from '@/lib/site'
import { ArrowUpRight, Globe, Mail, Phone, Pin, WhatsApp } from '../Icons'
import { ContactForm } from './Forms'

/** Contact page: pick the UK or German team, see their details, send a message. */
export function ContactPanel({ t, locale, privacyHref }: { t: Pick<Dict, 'contact' | 'form' | 'common' | 'footer'>; locale: Locale; privacyHref: string }) {
  const [team, setTeam] = useState<'uk' | 'de'>('uk')
  const c = t.contact
  return (
    <div className="split split-top">
      <div className="stack-md">
        <h2 style={{ fontSize: 'clamp(28px, 3vw, 38px)' }}>{c.whichTeam}</h2>
        <div className="team-toggle" role="group" aria-label={c.whichTeam}>
          <button type="button" aria-pressed={team === 'uk'} onClick={() => setTeam('uk')}>
            🇬🇧 {c.uk}
          </button>
          <button type="button" aria-pressed={team === 'de'} onClick={() => setTeam('de')}>
            🇩🇪 {c.de}
          </button>
        </div>

        {team === 'uk' ? (
          <div className="location-card" key="uk">
            <p>{c.ukText}</p>
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
            <div className="grid-2" style={{ gap: 20 }}>
              <div>
                <h4>{c.registeredOffice}</h4>
                <address style={{ marginTop: 8 }}>
                  {SITE.registeredOffice.map((l) => (
                    <span key={l}>
                      {l}
                      <br />
                    </span>
                  ))}
                </address>
              </div>
              <div>
                <h4>{c.fulfilmentCentre}</h4>
                <address style={{ marginTop: 8 }}>
                  {SITE.fulfilmentCentre.map((l) => (
                    <span key={l}>
                      {l}
                      <br />
                    </span>
                  ))}
                </address>
                <a className="text-link" href={mapsLink()} target="_blank" rel="noopener noreferrer">
                  <Pin size={18} /> {c.directions}
                </a>
              </div>
            </div>
            <p className="note">{c.hours}</p>
          </div>
        ) : (
          <div className="location-card" key="de">
            <p>{c.deText}</p>
            <ul className="contact-list">
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
                    <strong>
                      {SITE.germany.urlDisplay} <ArrowUpRight size={14} />
                    </strong>
                  </span>
                </a>
              </li>
            </ul>
            <div>
              <h4>{c.germanAddress}</h4>
              <address style={{ marginTop: 8 }}>
                {SITE.germany.operator}
                <br />
                {SITE.germany.address.map((l) => (
                  <span key={l}>
                    {l}
                    <br />
                  </span>
                ))}
              </address>
            </div>
            <p className="note">{c.deNote}</p>
          </div>
        )}
      </div>

      <div className="form-card">
        <h2 style={{ fontSize: 28 }}>{c.formTitle}</h2>
        <p style={{ color: 'var(--muted)', margin: '10px 0 24px' }}>{c.formText}</p>
        <ContactForm f={t.form} locale={locale} team={team} privacyHref={privacyHref} privacyLabel={t.footer.privacy} />
      </div>
    </div>
  )
}
