import { NextResponse } from 'next/server'
import { EDITOR_SESSION_COOKIE } from '@/content/config'
import { createSession, destroySession } from '@/editor/lib/auth'

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: '' }))
  const token = await createSession(typeof password === 'string' ? password : '')
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Väärä salasana' }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set(EDITOR_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return response
}

export async function DELETE() {
  await destroySession()
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(EDITOR_SESSION_COOKIE)
  return response
}
