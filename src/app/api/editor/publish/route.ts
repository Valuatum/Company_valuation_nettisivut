import { NextResponse } from 'next/server'
import { ACTIVE_PREVIEW_COOKIE } from '@/content/config'
import { isAuthenticated } from '@/editor/lib/auth'
import { publishDraft } from '@/editor/lib/draft'

// NOTE: publishing writes content JSON to the repo filesystem. On Vercel the
// filesystem is ephemeral — published changes persist only until next deploy.
// TODO(production): commit published content to git or move content to Blob/DB.
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Ei kirjautunut' }, { status: 401 })
  }
  await publishDraft()
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(ACTIVE_PREVIEW_COOKIE)
  return response
}
