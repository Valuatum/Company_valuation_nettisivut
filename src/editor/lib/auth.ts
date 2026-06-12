import 'server-only'
import { promises as fs } from 'fs'
import crypto from 'crypto'
import path from 'path'
import { cookies } from 'next/headers'
import { DRAFT_ROOT, EDITOR_SESSION_COOKIE } from '@/content/config'

const SESSIONS_FILE = path.join(process.cwd(), DRAFT_ROOT, 'sessions.json')

// TODO(production): set EDITOR_PASSWORD in Vercel env vars before go-live
function editorPassword() {
  return process.env.EDITOR_PASSWORD ?? 'valuatum-editor'
}

async function readSessions(): Promise<Record<string, number>> {
  try {
    return JSON.parse(await fs.readFile(SESSIONS_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

async function writeSessions(sessions: Record<string, number>) {
  await fs.mkdir(path.dirname(SESSIONS_FILE), { recursive: true })
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
}

export async function createSession(password: string): Promise<string | null> {
  if (password !== editorPassword()) return null
  const token = crypto.randomBytes(32).toString('hex')
  const sessions = await readSessions()
  sessions[token] = Date.now() + 1000 * 60 * 60 * 12
  await writeSessions(sessions)
  return token
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(EDITOR_SESSION_COOKIE)?.value
  if (!token) return false
  const sessions = await readSessions()
  const expiry = sessions[token]
  return typeof expiry === 'number' && expiry > Date.now()
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(EDITOR_SESSION_COOKIE)?.value
  if (!token) return
  const sessions = await readSessions()
  delete sessions[token]
  await writeSessions(sessions)
}
