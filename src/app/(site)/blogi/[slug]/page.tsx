import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/content/blog'
import { InlineMd } from '@/components/InlineMd'
import { safeJsonLd } from '@/lib/jsonld'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.seoTitle,
    description: post.metaDescription,
    alternates: { canonical: `/blogi/${post.slug}` },
    openGraph: { title: post.seoTitle, description: post.metaDescription, type: 'article' },
  }
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.h1,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'fi',
    author: { '@type': 'Organization', name: 'Valuatum Oy' },
    publisher: { '@type': 'Organization', name: 'Valuatum Oy', url: 'https://valuation.fi' },
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-20 lg:px-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <Link href="/blogi" className="text-sm text-green-deep transition-colors hover:text-green">
        ← Blogi
      </Link>
      <h1 className="mt-4 text-balance text-4xl font-light tracking-[-0.02em] text-charcoal lg:text-5xl">
        {post.h1}
      </h1>
      <time dateTime={post.date} className="mt-4 block text-[13px] text-charcoal-mid">
        Julkaistu{' '}
        {new Date(post.date).toLocaleDateString('fi-FI', { day: 'numeric', month: 'long', year: 'numeric' })}{' '}
        · Valuatum Oy
      </time>

      {post.sections.map((s) => (
        <section key={s.heading} className="mt-10">
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
        </section>
      ))}

      <aside className="mt-16 rounded-3xl bg-forest p-8 text-white">
        <h2 className="text-2xl font-light tracking-tight">Katso, miltä raportti näyttää käytännössä</h2>
        <p className="mt-3 text-[15px] font-light leading-relaxed text-white/75">
          AI-arvonmääritysraportti suomalaisesta yrityksestä — arvostusväli, menetelmät, skenaariot ja
          arvon ajurit yhdessä PDF:ssä. 79 € + alv.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/yritys" className="rounded-xl bg-green px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-green-deep">
            Tilaa raportti
          </Link>
          <Link href="/#esimerkit" className="rounded-xl border border-white/25 px-6 py-3 text-[15px] font-light text-white/90 transition-colors hover:bg-white/10">
            Katso esimerkkiraportti
          </Link>
        </div>
      </aside>
    </article>
  )
}
