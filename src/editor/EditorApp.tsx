'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ContentBundle } from '@/content/schema'

type Tab = { id: string; label: string; get: (b: ContentBundle) => unknown; set: (b: ContentBundle, value: unknown) => ContentBundle }

const TABS: Tab[] = [
  {
    id: 'home',
    label: 'Etusivu (fi)',
    get: (b) => b.locales.fi.home,
    set: (b, value) => ({ ...b, locales: { ...b.locales, fi: { ...b.locales.fi, home: value as ContentBundle['locales']['fi']['home'] } } }),
  },
  {
    id: 'site',
    label: 'Sivuston asetukset',
    get: (b) => b.site,
    set: (b, value) => ({ ...b, site: value as ContentBundle['site'] }),
  },
]

export function EditorApp() {
  const router = useRouter()
  const [bundle, setBundle] = useState<ContentBundle | null>(null)
  const [tabId, setTabId] = useState('home')
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [synced, setSynced] = useState<{ tabId: string; bundle: ContentBundle | null }>({
    tabId: '',
    bundle: null,
  })

  const tab = useMemo(() => TABS.find((t) => t.id === tabId)!, [tabId])

  useEffect(() => {
    fetch('/api/editor/draft')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Lataus epäonnistui'))))
      .then((data) => setBundle(data.bundle))
      .catch(() => setError('Sisällön lataus epäonnistui'))
  }, [])

  // Sync textarea with the active tab's slice during render (not in an effect)
  if (bundle && (synced.tabId !== tabId || synced.bundle !== bundle)) {
    setSynced({ tabId, bundle })
    setText(JSON.stringify(tab.get(bundle), null, 2))
  }

  const save = useCallback(async () => {
    if (!bundle) return
    setError('')
    setStatus('Tallennetaan…')
    let value: unknown
    try {
      value = JSON.parse(text)
    } catch {
      setStatus('')
      setError('JSON-muoto on virheellinen')
      return
    }
    const next = tab.set(bundle, value)
    const res = await fetch('/api/editor/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bundle: next }),
    })
    const data = await res.json()
    if (res.ok) {
      setBundle(data.bundle)
      setStatus('Luonnos tallennettu — esikatselu päällä tässä selaimessa')
    } else {
      setStatus('')
      setError(data.error ?? 'Tallennus epäonnistui')
    }
  }, [bundle, tab, text])

  const publish = useCallback(async () => {
    setError('')
    setStatus('Julkaistaan…')
    const res = await fetch('/api/editor/publish', { method: 'POST' })
    if (res.ok) {
      setStatus('Julkaistu')
    } else {
      setStatus('')
      setError('Julkaisu epäonnistui')
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/editor/auth', { method: 'DELETE' })
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-off-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-mist bg-white px-6 py-4">
        <h1 className="text-[15px] font-medium text-charcoal">Valuatum · Sisällön hallinta</h1>
        <div className="flex items-center gap-3 text-sm">
          <a href="/" target="_blank" className="text-green-deep hover:underline">
            Esikatsele sivua ↗
          </a>
          <button type="button" onClick={logout} className="text-steel hover:text-charcoal">
            Kirjaudu ulos
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTabId(t.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  t.id === tabId ? 'bg-forest text-white' : 'bg-white text-charcoal-mid hover:bg-mist'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              className="rounded-full bg-green px-5 py-2 text-sm font-medium text-white hover:bg-green-deep"
            >
              Tallenna luonnos
            </button>
            <button
              type="button"
              onClick={publish}
              className="rounded-full border border-green px-5 py-2 text-sm font-medium text-green-deep hover:bg-green-mist"
            >
              Julkaise
            </button>
          </div>
        </div>

        {(status || error) && (
          <p className={`mt-4 text-sm ${error ? 'text-red-600' : 'text-green-deep'}`}>{error || status}</p>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="mt-4 h-[70vh] w-full rounded-2xl border border-mist bg-white p-5 font-mono text-[13px] leading-relaxed text-charcoal outline-none focus:border-green"
        />
      </main>
    </div>
  )
}
