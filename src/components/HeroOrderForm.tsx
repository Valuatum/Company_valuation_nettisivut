'use client'

import { useState } from 'react'

type Props = {
  inputPlaceholder: string
  emailPlaceholder: string
  cta: string
  formNote: string
  contactEmail: string
}

const API = process.env.NEXT_PUBLIC_ORDERS_API ?? 'https://valu-pipeline-production-88f2.up.railway.app'

// ponytail: order intake only — Stripe checkout + automatic generation later,
// when the FID-less company resolution to Valuatum's systems exists.
export function HeroOrderForm({ inputPlaceholder, emailPlaceholder, cta, formNote, contactEmail }: Props) {
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [details, setDetails] = useState('')
  const [hp, setHp] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company.trim() || !email.trim() || state === 'sending') return
    setState('sending')
    try {
      const r = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.trim(),
          email: email.trim(),
          user_input: details.trim(),
          website: hp,
        }),
      })
      if (!r.ok) throw new Error(String(r.status))
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md">
        <p className="text-[17px] font-medium text-white">Kiitos tilauksesta!</p>
        <p className="mt-2 text-[14px] leading-relaxed text-white/70">
          Raportti yrityksestä <strong className="text-white">{company}</strong> toimitetaan
          osoitteeseen <strong className="text-white">{email}</strong>. Saat sen sähköpostiisi
          yleensä saman työpäivän aikana.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md sm:p-6">
      <label htmlFor="hero-company" className="sr-only">
        {inputPlaceholder}
      </label>
      <input
        id="hero-company"
        type="text"
        required
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder={inputPlaceholder}
        className="w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3.5 text-[15px] font-light text-white placeholder:text-white/45 outline-none transition-colors duration-200 focus:border-green-light"
      />
      <label htmlFor="hero-details" className="sr-only">
        Lisätiedot ja omat oletukset
      </label>
      <textarea
        id="hero-details"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        maxLength={4000}
        rows={3}
        placeholder="Lisätiedot ja omat oletukset (valinnainen): esim. merkittävät sopimukset, myyntiaikeet, oma kasvuoletus tai skenaarioiden todennäköisyydet — analyysi ottaa nämä huomioon."
        className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3.5 text-[15px] font-light text-white placeholder:text-white/45 outline-none transition-colors duration-200 focus:border-green-light"
      />
      {/* honeypot: hidden from humans, bots fill it */}
      <input
        type="text"
        name="website"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="hero-email" className="sr-only">
          {emailPlaceholder}
        </label>
        <input
          id="hero-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={emailPlaceholder.replace('(valinnainen)', '(toimitusosoite)')}
          className="w-full flex-1 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3.5 text-[15px] font-light text-white placeholder:text-white/45 outline-none transition-colors duration-200 focus:border-green-light"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="shrink-0 rounded-xl bg-green px-6 py-3.5 text-[15px] font-medium text-white transition-all duration-200 hover:bg-green-deep hover:shadow-[0_8px_24px_rgba(61,158,114,0.35)] disabled:opacity-60"
        >
          {state === 'sending' ? 'Lähetetään…' : cta}
        </button>
      </div>
      {state === 'error' && (
        <p className="mt-3 text-[13px] text-red-300">
          Tilauksen lähetys epäonnistui. Yritä hetken kuluttua uudelleen tai lähetä sähköpostia:{' '}
          <a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
      )}
      <p className="mt-3.5 text-[13px] leading-relaxed text-white/55">{formNote}</p>
    </form>
  )
}
