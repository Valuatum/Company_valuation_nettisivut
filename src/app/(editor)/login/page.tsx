'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/editor/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/editor')
    } else {
      setError('Väärä salasana')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-xl font-medium text-charcoal">Sisällön hallinta</h1>
        <p className="mt-1 text-sm text-steel">Kirjaudu muokataksesi sivuston sisältöä.</p>
        <label htmlFor="editor-password" className="sr-only">
          Salasana
        </label>
        <input
          id="editor-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Salasana"
          className="mt-6 w-full rounded-xl border border-mist px-4 py-3 text-[15px] outline-none focus:border-green"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-green px-4 py-3 text-[15px] font-medium text-white transition-colors hover:bg-green-deep disabled:opacity-60"
        >
          {loading ? 'Kirjaudutaan…' : 'Kirjaudu'}
        </button>
      </form>
    </div>
  )
}
