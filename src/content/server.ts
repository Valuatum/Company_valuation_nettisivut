import 'server-only'
import { promises as fs } from 'fs'
import path from 'path'
import { cache } from 'react'
import { CONTENT_ROOT, PAGE_DEFINITIONS } from '@/content/config'
import {
  contentBundleSchema,
  pageContentSchema,
  siteSettingsSchema,
  type ContentBundle,
  type Locale,
  type PageKey,
} from '@/content/schema'

function contentPath(...parts: string[]) {
  return path.join(process.cwd(), CONTENT_ROOT, ...parts)
}

// Site content is edited directly in src/content/*.json (a commit redeploys it).
// The old browser editor + draft preview were removed — they wrote to the
// filesystem, which does not work on Vercel's read-only serverless runtime.
// cache() dedupes the bundle load across layout, page and generateMetadata.
export const loadPublishedBundle = cache(async (): Promise<ContentBundle> => {
  const site = siteSettingsSchema.parse(
    JSON.parse(await fs.readFile(contentPath('site.json'), 'utf-8'))
  )
  const locales: Record<string, Record<string, unknown>> = { fi: {} }
  for (const def of PAGE_DEFINITIONS) {
    const raw = await fs.readFile(contentPath(def.locale, def.fileName), 'utf-8')
    locales[def.locale][def.key] = pageContentSchema.parse(JSON.parse(raw))
  }
  return contentBundleSchema.parse({ site, locales })
})

export async function getSiteSettings() {
  const bundle = await loadPublishedBundle()
  return bundle.site
}

export async function getPageContent(locale: Locale, key: PageKey) {
  const bundle = await loadPublishedBundle()
  const page = bundle.locales[locale]?.[key]
  if (!page) throw new Error(`Missing page content for ${locale}:${key}`)
  return page
}
