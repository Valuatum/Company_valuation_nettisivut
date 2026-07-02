'use client'

import { useRef, useState } from 'react'
import { postOrder } from '@/lib/orders'

const MAX_FILES = 10
const MAX_SIZE = 20 * 1024 * 1024 // 20 Mt

type Props = { sessionId: string | null }

export function UploadForm({ sessionId }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(list: FileList | null) {
    if (!list) return
    setError('')
    const incoming = Array.from(list)
    const rejected: string[] = []
    const accepted = incoming.filter((f) => {
      if (f.type !== 'application/pdf') {
        rejected.push(`${f.name}: vain PDF-tiedostot kelpaavat`)
        return false
      }
      if (f.size > MAX_SIZE) {
        rejected.push(`${f.name}: tiedosto on yli 20 Mt`)
        return false
      }
      return true
    })
    setFiles((prev) => {
      const next = [...prev, ...accepted]
      if (next.length > MAX_FILES) rejected.push(`Enintään ${MAX_FILES} tiedostoa`)
      return next.slice(0, MAX_FILES)
    })
    if (rejected.length) setError(rejected.join('. '))
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'sending') return
    if (!files.length) {
      setError('Lisää vähintään yksi PDF-tiedosto.')
      return
    }
    if (!company.trim() || !email.trim()) {
      setError('Täytä yrityksen nimi ja sähköpostiosoite.')
      return
    }
    setError('')
    setState('sending')

    const form = new FormData()
    form.append('company', company.trim())
    form.append('email', email.trim())
    if (message.trim()) form.append('message', message.trim())
    if (sessionId) form.append('sessionId', sessionId)
    files.forEach((f) => form.append('statements', f))

    try {
      const res = await fetch('/api/import', { method: 'POST', body: form })
      if (!res.ok) throw new Error(String(res.status))
      const note = [
        `TILINPÄÄTÖKSET LADATTU (${files.length} tiedostoa), Stripe session: ${sessionId ?? 'demo'}`,
        message.trim() ? `Viesti: ${message.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n')
      await postOrder({ company: company.trim(), email: email.trim(), user_input: note })
      setState('done')
    } catch {
      setState('idle')
      setError('Lähetys epäonnistui. Yritä hetken kuluttua uudelleen.')
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-3xl border border-mist bg-white p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-mist text-green-deep">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-5 text-2xl font-light tracking-tight text-charcoal">
          Tilinpäätökset vastaanotettu
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[14.5px] font-light leading-relaxed text-charcoal-mid">
          Saimme {files.length} tiedostoa yrityksestä <strong className="font-medium">{company}</strong>.
          Poimimme luvut ja laadimme raportin — valmis PDF toimitetaan osoitteeseen{' '}
          <strong className="font-medium">{email}</strong>, yleensä saman työpäivän aikana.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        className={`grid place-items-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200 ${
          dragging ? 'border-green bg-green-faint' : 'border-mist bg-white'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-green" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        <p className="mt-4 text-[16px] text-charcoal">
          Vedä ja pudota PDF-tilinpäätökset tähän
        </p>
        <p className="mt-1 text-[13px] font-light text-steel">
          Enintään {MAX_FILES} PDF-tiedostoa, kukin enintään 20 Mt — viimeiset 3–5 vuotta
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-full border border-mist px-5 py-2.5 text-sm font-medium text-charcoal transition-colors hover:border-green hover:text-green-deep"
        >
          Valitse tiedostot
        </button>
      </div>

      {files.length > 0 && (
        <ul className="mt-5 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-mist bg-white px-4 py-3"
            >
              <span className="min-w-0 truncate text-sm font-medium text-charcoal">
                {f.name}
                <span className="ml-2 text-xs font-normal text-steel">
                  {(f.size / 1024).toFixed(0)} kt
                </span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="shrink-0 text-sm text-steel transition-colors hover:text-red-600"
              >
                Poista
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="upload-company" className="mb-1.5 block text-[13px] font-medium text-charcoal">
            Yrityksen nimi
          </label>
          <input
            id="upload-company"
            type="text"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Esimerkki Oy"
            className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-[15px] font-light text-charcoal placeholder:text-steel outline-none transition-colors duration-200 focus:border-green"
          />
        </div>
        <div>
          <label htmlFor="upload-email" className="mb-1.5 block text-[13px] font-medium text-charcoal">
            Sähköposti raportin toimitusta varten
          </label>
          <input
            id="upload-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nimi@yritys.fi"
            className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-[15px] font-light text-charcoal placeholder:text-steel outline-none transition-colors duration-200 focus:border-green"
          />
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="upload-message" className="mb-1.5 block text-[13px] font-medium text-charcoal">
          Viesti (valinnainen)
        </label>
        <textarea
          id="upload-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Lisätiedot analyysia varten: esim. merkittävät sopimukset, myyntiaikeet tai oma kasvuoletus."
          className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-[15px] font-light text-charcoal placeholder:text-steel outline-none transition-colors duration-200 focus:border-green"
        />
      </div>

      {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-5 w-full rounded-full bg-green px-6 py-3.5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-green-deep disabled:opacity-60"
      >
        {state === 'sending'
          ? 'Lähetetään…'
          : files.length
            ? `Lähetä ${files.length} tiedostoa`
            : 'Lähetä tilinpäätökset'}
      </button>
      <p className="mt-3 text-[13px] leading-relaxed text-steel">
        Tiedostoja käytetään vain raportin laatimiseen, ellet ole ostohetkellä antanut
        lupaa lukujen anonyymiin hyödyntämiseen.
      </p>
    </form>
  )
}
