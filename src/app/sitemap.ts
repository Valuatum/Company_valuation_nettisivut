import type { MetadataRoute } from 'next'
import { blogPosts } from '@/content/blog'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://valuation.fi/', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://valuation.fi/yrityskauppa', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://valuation.fi/sukupolvenvaihdos', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://valuation.fi/yritys', changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://valuation.fi/laskuri', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://valuation.fi/kertoimet', changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://valuation.fi/tilinpaatokset', changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://valuation.fi/blogi', changeFrequency: 'weekly', priority: 0.6 },
    ...blogPosts.map((p) => ({
      url: `https://valuation.fi/blogi/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: 'https://valuation.fi/tietosuoja', changeFrequency: 'yearly' as const, priority: 0.3 },
  ]
}
