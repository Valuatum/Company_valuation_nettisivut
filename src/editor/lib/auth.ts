import 'server-only'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { EDITOR_SESSION_COOKIE } from '@/content/config'

const SESSION_MS = 1000 * 60 * 60 * 12

// Fail closed: with no EDITOR_PASSWORD set, return null so NO password can ever
// match. Previously this fell back to a known default ('valuatum-editor'),
// which let anyone into the content editor — and editor content is serialized
// into a JSON-LD <script>, i.e. a stored-XSS surface. Never ship a guessable
// default for an authentication secret.
function editorPassword(): string | null {
  return process.env.EDITOR_PASSWORD || null
}

// Stateless, signed-cookie sessions. The previous implementation stored a
// sessions map in .editor-data/sessions.json on the filesystem, which does NOT
// work on Vercel's read-only serverless filesystem: fs.writeFile threw on every
// successful login, so the auth route 500'd and the login page mislabeled it
// "Väärä salasana". A signed cookie needs no storage: the cookie holds an
// expiry + an HMAC of it, keyed by EDITOR_PASSWORD, and we re-verify on each
// request. Changing the password invalidates outstanding sessions (fine).
function sign(expiry: number, secret: string): string {
  return crypto.createHmac('sha256', secret).update(String(expiry)).digest('hex')
}

export async function createSession(password: string): Promise<string | null> {
  const expected = editorPassword()
  if (!expected || password !== expected) return null
  const expiry = Date.now() + SESSION_MS
  return `${expiry}.${sign(expiry, expected)}`
}

export async function isAuthenticated(): Promise<boolean> {
  const secret = editorPassword()
  if (!secret) return false
  const token = (await cookies()).get(EDITOR_SESSION_COOKIE)?.value
  if (!token) return false
  const [expiryStr, mac] = token.split('.')
  const expiry = Number(expiryStr)
  if (!expiryStr || !mac || !Number.isFinite(expiry) || expiry <= Date.now()) return false
  const expected = sign(expiry, secret)
  // Constant-time compare; timingSafeEqual throws on length mismatch.
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Stateless: nothing to delete server-side. The auth route clears the cookie.
export async function destroySession() {}
