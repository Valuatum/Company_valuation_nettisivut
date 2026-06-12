import 'server-only'
import { promises as fs } from 'fs'
import path from 'path'
import { CONTENT_ROOT, DRAFT_ROOT, PAGE_DEFINITIONS } from '@/content/config'
import { contentBundleSchema, type ContentBundle } from '@/content/schema'
import { loadPublishedBundle } from '@/content/server'

export const CURRENT_DRAFT_ID = 'current'

const draftPath = path.join(process.cwd(), DRAFT_ROOT, 'drafts', `${CURRENT_DRAFT_ID}.json`)

export async function loadDraftBundle(): Promise<ContentBundle> {
  try {
    const raw = await fs.readFile(draftPath, 'utf-8')
    return contentBundleSchema.parse(JSON.parse(raw).bundle)
  } catch {
    return loadPublishedBundle()
  }
}

export async function saveDraftBundle(bundle: unknown): Promise<ContentBundle> {
  const parsed = contentBundleSchema.parse(bundle)
  await fs.mkdir(path.dirname(draftPath), { recursive: true })
  await fs.writeFile(draftPath, JSON.stringify({ savedAt: new Date().toISOString(), bundle: parsed }, null, 2))
  return parsed
}

export async function publishDraft(): Promise<void> {
  const bundle = await loadDraftBundle()
  const root = path.join(process.cwd(), CONTENT_ROOT)
  await fs.writeFile(path.join(root, 'site.json'), JSON.stringify(bundle.site, null, 2) + '\n')
  for (const def of PAGE_DEFINITIONS) {
    const page = bundle.locales[def.locale]?.[def.key]
    if (!page) continue
    await fs.writeFile(path.join(root, def.locale, def.fileName), JSON.stringify(page, null, 2) + '\n')
  }
  await fs.rm(draftPath, { force: true })
}
