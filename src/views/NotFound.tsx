import Link from 'next/link'
import { getDict } from '@/content'
import { href, type Locale } from '@/lib/routes'

export function NotFoundView({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  return (
    <section className="section not-found">
      <div className="container">
        <p className="code">404 · PARCEL NOT FOUND</p>
        <h1>{t.notFound.title}</h1>
        <p className="body-text" style={{ margin: '0 auto 28px' }}>
          {t.notFound.text}
        </p>
        <Link href={href(locale, 'home')} className="btn btn-primary">
          {t.notFound.back}
        </Link>
      </div>
    </section>
  )
}
