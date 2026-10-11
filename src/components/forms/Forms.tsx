'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import type { Dict } from '@/content'
import type { Locale } from '@/lib/routes'
import { ArrowRight, CheckCircle } from '../Icons'

type F = Dict['form']
type Errors = Record<string, string>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function Field({
  id,
  label,
  required,
  hint,
  error,
  reqLabel,
  children,
}: {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  reqLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required ? (
          <>
            <span className="req" aria-hidden="true">
              {' '}
              *
            </span>
            <span className="sr-only"> ({reqLabel})</span>
          </>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const describe = (id: string, hint?: string, error?: string) => [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined

function Select({ id, options, f, error, hint }: { id: string; options: string[]; f: F; error?: string; hint?: string }) {
  return (
    <select id={id} name={id} className="input" defaultValue="" aria-invalid={error ? true : undefined} aria-describedby={describe(id, hint, error)}>
      <option value="" disabled>
        {f.select}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

function Radios({ name, options, legend }: { name: string; options: string[]; legend: string }) {
  return (
    <fieldset>
      <legend className="field-label" style={{ fontFamily: 'inherit', textTransform: 'none', letterSpacing: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>
        {legend}
      </legend>
      <div className="options">
        {options.map((o) => (
          <label key={o} className="option">
            <input type="radio" name={name} value={o} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Consent({ f, error, privacyHref, privacyLabel }: { f: F; error?: string; privacyHref: string; privacyLabel: string }) {
  return (
    <div className="field">
      <label className="consent">
        <input type="checkbox" name="consent" value="yes" aria-invalid={error ? true : undefined} aria-describedby={error ? 'consent-error' : undefined} />
        <span>
          {f.consent}{' '}
          <Link href={privacyHref} target="_blank">
            {privacyLabel}
          </Link>
          <span className="req" aria-hidden="true">
            {' '}
            *
          </span>
          <span className="sr-only"> ({f.required})</span>
        </span>
      </label>
      {error ? (
        <p className="field-error" id="consent-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function useSubmit(endpoint: string, f: F, validate: (data: FormData) => Errors) {
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const errs = validate(data)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)
      first?.focus()
      return
    }
    setStatus('sending')
    const payload: Record<string, unknown> = {}
    data.forEach((v, k) => {
      if (k === 'salesChannels') payload[k] = [...((payload[k] as string[]) ?? []), String(v)]
      else payload[k] = String(v)
    })
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      form.reset()
      requestAnimationFrame(() => doneRef.current?.focus())
    } catch {
      setStatus('error')
    }
  }

  return { errors, status, setStatus, onSubmit, formRef, doneRef, f }
}

function Success({ f, onAgain, doneRef }: { f: F; onAgain: () => void; doneRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="form-success" ref={doneRef} tabIndex={-1} role="status">
      <CheckCircle size={28} />
      <h3>{f.successTitle}</h3>
      <p>{f.successText}</p>
      <div>
        <button type="button" className="btn btn-ghost" onClick={onAgain}>
          {f.sendAnother}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Quote form                                                          */
/* ------------------------------------------------------------------ */
export function QuoteForm({ f, locale, privacyHref, privacyLabel }: { f: F; locale: Locale; privacyHref: string; privacyLabel: string }) {
  const s = useSubmit('/api/quote', f, (d) => {
    const e: Errors = {}
    for (const k of ['firstName', 'lastName', 'companyName', 'email', 'monthlyOrders']) if (!String(d.get(k) ?? '').trim()) e[k] = f.errorRequired
    if (!e.email && !EMAIL.test(String(d.get('email')))) e.email = f.errorEmail
    if (!d.get('consent')) e.consent = f.errorConsent
    return e
  })
  const { errors: er } = s
  if (s.status === 'sent') return <Success f={f} onAgain={() => s.setStatus('idle')} doneRef={s.doneRef} />
  return (
    <form className="form" ref={s.formRef} onSubmit={s.onSubmit} noValidate>
      <input type="hidden" name="locale" value={locale} />
      <div className="hp" aria-hidden="true">
        <label htmlFor="companyUrl">{f.honeypot}</label>
        <input id="companyUrl" name="companyUrl" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {Object.keys(er).length ? (
        <p className="form-status error" role="alert">
          {f.errorSummary}
        </p>
      ) : null}

      <fieldset>
        <legend>{f.sections.you}</legend>
        <div className="form-row">
          <Field id="firstName" label={f.firstName} required error={er.firstName} reqLabel={f.required}>
            <input id="firstName" name="firstName" className="input" autoComplete="given-name" aria-invalid={er.firstName ? true : undefined} aria-describedby={describe('firstName', undefined, er.firstName)} />
          </Field>
          <Field id="lastName" label={f.lastName} required error={er.lastName} reqLabel={f.required}>
            <input id="lastName" name="lastName" className="input" autoComplete="family-name" aria-invalid={er.lastName ? true : undefined} aria-describedby={describe('lastName', undefined, er.lastName)} />
          </Field>
        </div>
        <div className="form-row">
          <Field id="companyName" label={f.companyName} required error={er.companyName} reqLabel={f.required}>
            <input id="companyName" name="companyName" className="input" autoComplete="organization" aria-invalid={er.companyName ? true : undefined} aria-describedby={describe('companyName', undefined, er.companyName)} />
          </Field>
          <Field id="email" label={f.email} required error={er.email} reqLabel={f.required}>
            <input id="email" name="email" type="email" className="input" autoComplete="email" aria-invalid={er.email ? true : undefined} aria-describedby={describe('email', undefined, er.email)} />
          </Field>
        </div>
        <div className="form-row">
          <Field id="telephone" label={f.telephone} reqLabel={f.required}>
            <input id="telephone" name="telephone" type="tel" className="input" autoComplete="tel" />
          </Field>
          <Field id="website" label={f.website} hint={f.websiteHint} reqLabel={f.required}>
            <input id="website" name="website" type="url" className="input" autoComplete="url" inputMode="url" aria-describedby="website-hint" />
          </Field>
        </div>
        <Field id="country" label={f.country} reqLabel={f.required}>
          <input id="country" name="country" className="input" autoComplete="country-name" />
        </Field>
      </fieldset>

      <fieldset>
        <legend>{f.sections.operation}</legend>
        <div className="form-row">
          <Field id="monthlyOrders" label={f.monthlyOrders} required error={er.monthlyOrders} reqLabel={f.required}>
            <Select id="monthlyOrders" options={f.monthlyOrdersOptions} f={f} error={er.monthlyOrders} />
          </Field>
          <Field id="skuCount" label={f.skuCount} reqLabel={f.required}>
            <Select id="skuCount" options={f.skuCountOptions} f={f} />
          </Field>
        </div>
        <div className="form-row">
          <Field id="avgItemsPerOrder" label={f.avgItems} hint={f.avgItemsHint} reqLabel={f.required}>
            <input id="avgItemsPerOrder" name="avgItemsPerOrder" className="input" inputMode="decimal" aria-describedby="avgItemsPerOrder-hint" />
          </Field>
          <Field id="storageRequirement" label={f.storage} reqLabel={f.required}>
            <Select id="storageRequirement" options={f.storageOptions} f={f} />
          </Field>
        </div>
        <fieldset>
          <legend className="field-label" style={{ fontFamily: 'inherit', textTransform: 'none', letterSpacing: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>
            {f.channels}
          </legend>
          <p className="field-hint" style={{ marginTop: -8 }}>
            {f.channelsHint}
          </p>
          <div className="options">
            {f.channelOptions.map((o) => (
              <label key={o} className="option">
                <input type="checkbox" name="salesChannels" value={o} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <fieldset>
        <legend>{f.sections.parcels}</legend>
        <div className="form-row">
          <Field id="avgParcelWeight" label={f.weight} reqLabel={f.required}>
            <Select id="avgParcelWeight" options={f.weightOptions} f={f} />
          </Field>
          <Field id="parcelSize" label={f.size} reqLabel={f.required}>
            <Select id="parcelSize" options={f.sizeOptions} f={f} />
          </Field>
        </div>
        <Radios name="deliverySpeed" legend={f.speed} options={f.speedOptions} />
      </fieldset>

      <fieldset>
        <legend>{f.sections.extras}</legend>
        <Radios name="fbaSupport" legend={f.fba} options={[f.yes, f.no]} />
        <Radios name="returnsHandling" legend={f.returns} options={[f.yes, f.no]} />
        <Field id="message" label={f.message} hint={f.messageHint} reqLabel={f.required}>
          <textarea id="message" name="message" className="input" rows={5} aria-describedby="message-hint" />
        </Field>
        <Field id="hearAboutUs" label={f.hear} reqLabel={f.required}>
          <Select id="hearAboutUs" options={f.hearOptions} f={f} />
        </Field>
      </fieldset>

      <Consent f={f} error={er.consent} privacyHref={privacyHref} privacyLabel={privacyLabel} />
      {s.status === 'error' ? (
        <p className="form-status error" role="alert">
          {f.errorSend}
        </p>
      ) : null}
      <div className="btn-row" style={{ alignItems: 'center' }}>
        <button type="submit" className="btn btn-primary" disabled={s.status === 'sending'}>
          {s.status === 'sending' ? f.sending : f.submit} <ArrowRight />
        </button>
        <span className="field-hint">{f.noObligation}</span>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Contact form                                                        */
/* ------------------------------------------------------------------ */
export function ContactForm({ f, locale, team, privacyHref, privacyLabel }: { f: F; locale: Locale; team: 'uk' | 'de'; privacyHref: string; privacyLabel: string }) {
  const s = useSubmit('/api/contact', f, (d) => {
    const e: Errors = {}
    for (const k of ['name', 'email', 'message']) if (!String(d.get(k) ?? '').trim()) e[k] = f.errorRequired
    if (!e.email && !EMAIL.test(String(d.get('email')))) e.email = f.errorEmail
    if (!d.get('consent')) e.consent = f.errorConsent
    return e
  })
  const { errors: er } = s
  if (s.status === 'sent') return <Success f={f} onAgain={() => s.setStatus('idle')} doneRef={s.doneRef} />
  return (
    <form className="form" ref={s.formRef} onSubmit={s.onSubmit} noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="team" value={team} />
      <div className="hp" aria-hidden="true">
        <label htmlFor="c-companyUrl">{f.honeypot}</label>
        <input id="c-companyUrl" name="companyUrl" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-row">
        <Field id="name" label={f.name} required error={er.name} reqLabel={f.required}>
          <input id="name" name="name" className="input" autoComplete="name" aria-invalid={er.name ? true : undefined} aria-describedby={describe('name', undefined, er.name)} />
        </Field>
        <Field id="c-email" label={f.email} required error={er.email} reqLabel={f.required}>
          <input id="c-email" name="email" type="email" className="input" autoComplete="email" aria-invalid={er.email ? true : undefined} aria-describedby={describe('c-email', undefined, er.email)} />
        </Field>
      </div>
      <Field id="c-telephone" label={f.telephone} reqLabel={f.required}>
        <input id="c-telephone" name="telephone" type="tel" className="input" autoComplete="tel" />
      </Field>
      <Field id="c-message" label={f.message} required error={er.message} reqLabel={f.required}>
        <textarea id="c-message" name="message" className="input" rows={5} aria-invalid={er.message ? true : undefined} aria-describedby={describe('c-message', undefined, er.message)} />
      </Field>
      <Consent f={f} error={er.consent} privacyHref={privacyHref} privacyLabel={privacyLabel} />
      {s.status === 'error' ? (
        <p className="form-status error" role="alert">
          {f.errorSend}
        </p>
      ) : null}
      <div>
        <button type="submit" className="btn btn-primary" disabled={s.status === 'sending'}>
          {s.status === 'sending' ? f.sending : f.submit} <ArrowRight />
        </button>
      </div>
    </form>
  )
}
