import 'server-only'
import { promises as fs } from 'fs'
import path from 'path'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { ACTIVE_PREVIEW_COOKIE, CONTENT_ROOT, DRAFT_ROOT, PAGE_DEFINITIONS } from '@/content/config'
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

export async function loadPublishedBundle(): Promise<ContentBundle> {
  const site = siteSettingsSchema.parse(
    JSON.parse(await fs.readFile(contentPath('site.json'), 'utf-8'))
  )
  const locales: Record<string, Record<string, unknown>> = { fi: {} }
  for (const def of PAGE_DEFINITIONS) {
    const raw = await fs.readFile(contentPath(def.locale, def.fileName), 'utf-8')
    locales[def.locale][def.key] = pageContentSchema.parse(JSON.parse(raw))
  }
  return contentBundleSchema.parse({ site, locales })
}

// cache() dedupes the bundle load across layout, page and generateMetadata
export const loadActiveBundle = cache(async (): Promise<ContentBundle> => {
  const cookieStore = await cookies()
  const draftId = cookieStore.get(ACTIVE_PREVIEW_COOKIE)?.value
  if (!draftId) return loadPublishedBundle()
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), DRAFT_ROOT, 'drafts', `${draftId}.json`),
      'utf-8'
    )
    return contentBundleSchema.parse(JSON.parse(raw).bundle)
  } catch {
    return loadPublishedBundle()
  }
})

export async function getSiteSettings() {
  const bundle = await loadActiveBundle()
  return bundle.site
}

export async function getPageContent(locale: Locale, key: PageKey) {
  const bundle = await loadActiveBundle()
  const page = bundle.locales[locale]?.[key]
  if (!page) throw new Error(`Missing page content for ${locale}:${key}`)
  return page
}
