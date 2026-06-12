'use client'

import { useState } from 'react'

type Props = {
  inputPlaceholder: string
  emailPlaceholder: string
  cta: string
  formNote: string
  contactEmail: string
}

// TODO(backend): replace mailto flow with company search API + Stripe checkout
// - company search: lookup by name / Y-tunnus (PRH/YTJ)
// - order: create checkout session, then trigger report generation
// - delivery: email the generated PDF to the customer
export function HeroOrderForm({ inputPlaceholder, emailPlaceholder, cta, formNote, contactEmail }: Props) {
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company.trim()) return
    const subject = encodeURIComponent(`Raporttitilaus: ${company.trim()}`)
    const body = encodeURIComponent(
      `Haluan tilata AI-arvonmääritysraportin.\n\nYritys / Y-tunnus: ${company.trim()}\nToimitusosoite (sähköposti): ${email.trim() || '(täydennän vastauksessa)'}\n\nLähetetty valuation.fi-sivulta.`
    )
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
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
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="hero-email" className="sr-only">
          {emailPlaceholder}
        </label>
        <input
          id="hero-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={emailPlaceholder}
          className="w-full flex-1 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3.5 text-[15px] font-light text-white placeholder:text-white/45 outline-none transition-colors duration-200 focus:border-green-light"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-green px-6 py-3.5 text-[15px] font-medium text-white transition-all duration-200 hover:bg-green-deep hover:shadow-[0_8px_24px_rgba(61,158,114,0.35)]"
        >
          {cta}
        </button>
      </div>
      <p className="mt-3.5 text-[13px] leading-relaxed text-white/55">{formNote}</p>
    </form>
  )
}
