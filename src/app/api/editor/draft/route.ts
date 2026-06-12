import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ACTIVE_PREVIEW_COOKIE } from '@/content/config'
import { isAuthenticated } from '@/editor/lib/auth'
import { CURRENT_DRAFT_ID, loadDraftBundle, saveDraftBundle } from '@/editor/lib/draft'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Ei kirjautunut' }, { status: 401 })
  }
  const bundle = await loadDraftBundle()
  return NextResponse.json({ ok: true, bundle })
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Ei kirjautunut' }, { status: 401 })
  }
  try {
    const { bundle } = await request.json()
    const parsed = await saveDraftBundle(bundle)
    const response = NextResponse.json({ ok: true, bundle: parsed })
    // Enable draft preview on the public site for this browser
    response.cookies.set(ACTIVE_PREVIEW_COOKIE, CURRENT_DRAFT_ID, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    return response
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
        : 'Virheellinen sisältö'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
