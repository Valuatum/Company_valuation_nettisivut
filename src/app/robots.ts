import type { MetadataRoute } from 'next'

// One allow-all rule covers Google + AI crawlers (GPTBot, ClaudeBot,
// PerplexityBot, Google-Extended) — being citable by AI assistants is a goal.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/editor', '/login', '/api/'] }],
    sitemap: 'https://valuation.fi/sitemap.xml',
  }
}
