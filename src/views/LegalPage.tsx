import { PageHero } from '@/components/ui'
import { Reveal } from '@/components/Motion'
import { SITE } from '@/lib/site'
import type { ViewProps } from './render'

/** Turns plain email addresses and ico.org.uk in legal copy into links. */
function linkify(text: string) {
  const parts = text.split(/(info@depoxpress\.com|ico\.org\.uk)/g)
  return parts.map((part, i) =>
    part === SITE.email ? (
      <a key={i} href={`mailto:${SITE.email}`}>
        {part}
      </a>
    ) : part === 'ico.org.uk' ? (
      <a key={i} href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      part
    ),
  )
}

export function LegalPage({ locale, t, doc }: ViewProps & { doc: 'privacy' | 'cookies' | 'terms' | 'legal' }) {
  const d = t.legalDocs[doc]
  return (
    <>
      <PageHero locale={locale} t={t} crumbs={[{ label: d.title }]} eyebrow={t.footer.legalHeading} title={d.title} lead={d.intro}>
        <p className="updated">
          {t.common.lastUpdated}: {t.common.updatedDate}
        </p>
      </PageHero>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="prose">
            <p className="draft-note">{t.common.draftNote}</p>
            {d.sections.map((s) => (
              <div key={s.heading} className="prose">
                <h2>{s.heading}</h2>
                {s.paragraphs?.map((p) => <p key={p}>{linkify(p)}</p>)}
                {s.list ? (
                  <ul>
                    {s.list.map((li) => (
                      <li key={li}>{linkify(li)}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  )
}
