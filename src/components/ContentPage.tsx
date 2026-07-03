import Link from 'next/link'
import { InlineMd } from '@/components/InlineMd'

export type ContentSection = {
  heading: string
  paragraphs: string[]
  listItems?: string[]
  table?: { columns: string[]; rows: string[][] }
}

export type ContentPageData = {
  slug: string
  seoTitle: string
  metaDescription: string
  h1: string
  leadParagraph: string
  sections: ContentSection[]
  faq: { question: string; answer: string }[]
  ctaHeading: string
  ctaText: string
}

export function contentPageJsonLd(page: ContentPageData) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: page.h1,
        description: page.metaDescription,
        inLanguage: 'fi',
        author: { '@type': 'Organization', name: 'Valuatum Oy' },
        publisher: { '@type': 'Organization', name: 'Valuatum Oy', url: 'https://valuation.fi' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((i) => ({
          '@type': 'Question',
          name: i.question,
          acceptedAnswer: { '@type': 'Answer', text: i.answer },
        })),
      },
    ],
  }
}

export function ContentPage({ page }: { page: ContentPageData }) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20 lg:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contentPageJsonLd(page)) }}
      />
      <h1 className="text-balance text-4xl font-light tracking-[-0.02em] text-charcoal lg:text-5xl">
        {page.h1}
      </h1>
      <p className="mt-6 text-pretty text-[18px] font-light leading-relaxed text-charcoal-mid">
        <InlineMd text={page.leadParagraph} />
      </p>

      {page.sections.map((s) => (
        <section key={s.heading} className="mt-12">
          <h2 className="text-2xl font-medium tracking-tight text-forest">{s.heading}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="mt-4 text-[15.5px] leading-relaxed text-charcoal/80">
              <InlineMd text={p} />
            </p>
          ))}
          {s.listItems && s.listItems.length > 0 && (
            <ul className="mt-4 space-y-2.5">
              {s.listItems.map((li, i) => (
                <li key={i} className="flex gap-3 text-[15.5px] leading-relaxed text-charcoal/80">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-green" />
                  <InlineMd text={li} />
                </li>
              ))}
            </ul>
          )}
          {s.table && s.table.columns.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-[14.5px]">
                <thead>
                  <tr>
                    {s.table.columns.map((c) => (
                      <th key={c} className="border-b-2 border-green/40 px-3 py-2 text-left font-semibold text-forest">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((r, i) => (
                    <tr key={i} className="border-b border-mist">
                      {r.map((cell, j) => (
                        <td key={j} className="px-3 py-2.5 align-top text-charcoal/80">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      <section className="mt-14">
        <h2 className="text-2xl font-medium tracking-tight text-forest">Usein kysytyt kysymykset</h2>
        <dl className="mt-5 space-y-6">
          {page.faq.map((i) => (
            <div key={i.question}>
              <dt className="font-medium text-charcoal">{i.question}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-charcoal/75">{i.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <aside className="mt-16 rounded-3xl bg-forest p-8 text-white">
        <h2 className="text-2xl font-light tracking-tight">{page.ctaHeading}</h2>
        <p className="mt-3 text-[15px] font-light leading-relaxed text-white/75">
          <InlineMd text={page.ctaText} />
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/yritys"
            className="rounded-xl bg-green px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-green-deep"
          >
            Tilaa raportti — 79 € + alv
          </Link>
          <Link
            href="/#esimerkit"
            className="rounded-xl border border-white/25 px-6 py-3 text-[15px] font-light text-white/90 transition-colors hover:bg-white/10"
          >
            Katso esimerkkiraportti
          </Link>
        </div>
      </aside>
    </article>
  )
}
