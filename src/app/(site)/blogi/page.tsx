import type { Metadata } from 'next'
import Link from 'next/link'
import { blogIndexIntro, blogPosts } from '@/content/blog'

export const metadata: Metadata = {
  title: 'Blogi — yrityksen arvonmääritys | Valuatum',
  description:
    'Asiantuntija-artikkeleita yrityksen arvonmäärityksestä: menetelmät, skenaariot, tekoälyn rooli ja arvon ajurit suomalaisissa yrityksissä.',
  alternates: { canonical: '/blogi' },
}

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-0">
      <h1 className="text-balance text-4xl font-light tracking-[-0.02em] text-charcoal lg:text-5xl">
        Blogi
      </h1>
      <p className="mt-5 text-pretty text-[17px] font-light leading-relaxed text-charcoal-mid">
        {blogIndexIntro}
      </p>
      <div className="mt-12 space-y-8">
        {blogPosts.map((post) => (
          <article key={post.slug} className="rounded-3xl border border-mist bg-white p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-green/40 hover:shadow-[0_16px_48px_rgba(26,36,32,0.10)]">
            <time dateTime={post.date} className="text-[13px] text-charcoal-mid">
              {new Date(post.date).toLocaleDateString('fi-FI', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
            <h2 className="mt-2 text-2xl font-medium tracking-tight text-forest">
              <Link href={`/blogi/${post.slug}`} className="transition-colors hover:text-green-deep">
                {post.h1}
              </Link>
            </h2>
            <p className="mt-3 text-[15px] font-light leading-relaxed text-charcoal/75">{post.excerpt}</p>
            <Link
              href={`/blogi/${post.slug}`}
              className="mt-4 inline-block text-sm font-medium text-green-deep transition-colors hover:text-green"
            >
              Lue artikkeli →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
