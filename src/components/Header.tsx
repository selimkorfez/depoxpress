'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { href, resolve, type Locale } from '@/lib/routes'
import { ArrowRight, Cross, LogoMark, Menu } from './Icons'

export type NavItem = { href: string; label: string }

export function Logo({ homeHref, label }: { homeHref: string; label: string }) {
  return (
    <Link href={homeHref} className="logo" aria-label={label}>
      <LogoMark className="logo-mark" />
      <span>
        DEPOXPRESS <em>UK</em>
      </span>
    </Link>
  )
}

/** Remembers the visitor's language choice (functional cookie, see Cookie Policy). */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`
}

export function LangSwitch({ locale, altHref, label }: { locale: Locale; altHref: string; label: string }) {
  const other: Locale = locale === 'en' ? 'tr' : 'en'
  const items = (['en', 'tr'] as Locale[]).map((l) =>
    l === locale ? (
      <span key={l} aria-current="true">
        {l.toUpperCase()}
      </span>
    ) : (
      <a key={l} href={altHref} hrefLang={l} lang={l} aria-label={label} onClick={() => setLocaleCookie(other)}>
        {l.toUpperCase()}
      </a>
    ),
  )
  return (
    <div className="lang" role="group" aria-label="Language">
      {items}
    </div>
  )
}

export function Header({
  locale,
  nav,
  homeHref,
  quoteHref,
  quoteLabel,
  labels,
}: {
  locale: Locale
  nav: NavItem[]
  homeHref: string
  quoteHref: string
  quoteLabel: string
  labels: { home: string; open: string; close: string; nav: string; switchLanguage: string }
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  // the same page in the other language (falls back to its home page)
  const other: Locale = locale === 'en' ? 'tr' : 'en'
  const segments = pathname.split('/').filter(Boolean)
  const key = resolve(locale, locale === 'en' ? segments : segments.slice(1))
  const altHref = href(other, key ?? 'home')

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.dataset.menuOpen = open ? 'true' : 'false'
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (href: string) => pathname === href || (href !== homeHref && pathname.startsWith(href + '/'))

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Logo homeHref={homeHref} label={labels.home} />
          <nav className="nav" aria-label={labels.nav}>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <LangSwitch locale={locale} altHref={altHref} label={labels.switchLanguage} />
            <Link href={quoteHref} className="btn btn-primary">
              {quoteLabel}
            </Link>
            <button
              type="button"
              className="menu-btn"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? labels.close : labels.open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <Cross size={22} /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <div id="mobile-menu" className="mobile-menu" data-open={open} hidden={false} aria-hidden={!open}>
        <nav aria-label={labels.nav}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} tabIndex={open ? 0 : -1} aria-current={isActive(n.href) ? 'page' : undefined}>
              {n.label}
              <ArrowRight />
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-foot">
          <Link href={quoteHref} className="btn btn-primary" tabIndex={open ? 0 : -1}>
            {quoteLabel} <ArrowRight />
          </Link>
          <LangSwitch locale={locale} altHref={altHref} label={labels.switchLanguage} />
        </div>
      </div>
    </>
  )
}
