import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://valuation.fi/', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://valuation.fi/tietosuoja', changeFrequency: 'yearly', priority: 0.3 },
  ]
}
