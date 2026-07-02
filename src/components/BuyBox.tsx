'use client'

import { useState, type FormEvent } from 'react'
import { eur, quote, type ReportKind } from '@/lib/pricing'

type Props = {
  companyId: string
  companyName: string
  hasFinancials: boolean
}

const BADGE: Record<ReportKind, string> = {
  existing: 'Arvonmääritysraportti',
  import: 'Omat tilinpäätökset + raportti',
  creditsafe: 'Tietojen haku + raportti',
}

const LEAD: Record<ReportKind, (name: string) => string> = {
  existing: (name) =>
    `Tilinpäätöstiedot yritykselle ${name} ovat jo hallussamme. Raportti laaditaan automaattisesti maksun jälkeen.`,
  import: () =>
    'Maksat ensin ja lataat sen jälkeen tilinpäätökset (enintään viideltä vuodelta). Poimimme luvut ja laadimme raportin.',
  creditsafe: () =>
    'Haemme viralliset tilinpäätöstiedot puolestasi, minkä jälkeen raportti laaditaan automaattisesti. Sinun ei tarvitse ladata mitään.',
}

const OPTIONS: { kind: Exclude<ReportKind, 'existing'>; label: string; description: string }[] = [
  {
    kind: 'import',
    label: 'Lataan tilinpäätökset itse',
    description: 'Lataat tilinpäätös-PDF:t maksun jälkeen. Poimimme luvut niistä.',
  },
  {
    kind: 'creditsafe',
    label: 'Haette tiedot puolestani',
    description: 'Haemme viralliset tilinpäätöstiedot, sinun ei tarvitse toimittaa mitään.',
  },
]

export function BuyBox({ companyId, companyName, hasFinancials }: Props) {
  const [kind, setKind] = useState<ReportKind>(hasFinancials ? 'existing' : 'import')
  // Imports default to sharing on (the cheaper, catalogue-building choice).
  const [share, setShare] = useState(true)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shareActive = kind === 'import' && share
  const { base, discount, total } = quote(kind, shareActive)

  async function checkout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          companyId,
          companyName,
          shareData: shareActive,
          customerEmail: email,
        }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Maksun käynnistäminen epäonnistui. Yritä uudelleen.')
        setLoading(false)
      }
    } catch {
      setError('Verkkovirhe. Yritä uudelleen.')
      setLoading(false)
    }
  }

  return (
    <aside className="overflow-hidden rounded-3xl border border-mist bg-white shadow-[0_20px_60px_rgba(26,36,32,0.1)]">
      <div className="bg-forest p-6 text-white">
        <p className="text-[12.5px] font-medium text-green-light">{BADGE[kind]}</p>
        <h2 className="mt-1 text-2xl font-light tracking-tight">{companyName}</h2>
        <div className="mt-4 flex items-end gap-2">
          {discount > 0 && (
            <span className="pb-1.5 text-sm text-white/40 line-through">{eur(base)}</span>
          )}
          <span className="text-[2.6rem] font-light leading-none tracking-tight">{eur(total)}</span>
        </div>
        <p className="mt-2 text-xs text-white/50">Kertamaksu per raportti, ei tilausta. Hintoihin lisätään alv.</p>
      </div>

      <form onSubmit={checkout} className="p-6">
        <p className="text-sm font-light leading-relaxed text-charcoal-mid">
          {LEAD[kind](companyName)}
        </p>

        {!hasFinancials && (
          <fieldset className="mt-5">
            <legend className="text-[13px] font-medium text-charcoal">
              Miten tilinpäätöstiedot toimitetaan?
            </legend>
            <div className="mt-2.5 space-y-2.5">
              {OPTIONS.map((o) => (
                <label
                  key={o.kind}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                    kind === o.kind ? 'border-green bg-green-faint' : 'border-mist hover:border-green/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="buybox-kind"
                    checked={kind === o.kind}
                    onChange={() => setKind(o.kind)}
                    className="mt-1 h-4 w-4 accent-green"
                  />
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-charcoal">{o.label}</span>
                      <span className="shrink-0 text-[13px] text-steel">
                        {eur(quote(o.kind, false).total)}
                      </span>
                    </span>
                    <span className="mt-1 block text-[13px] font-light leading-relaxed text-charcoal-mid">
                      {o.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {kind === 'import' && (
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-mist bg-off-white p-4 transition-colors hover:border-green/40">
            <input
              type="checkbox"
              checked={share}
              onChange={(e) => setShare(e.target.checked)}
              className="mt-1 h-4 w-4 accent-green"
            />
            <span className="text-sm">
              <span className="font-medium text-charcoal">
                Salli lukujen uudelleenkäyttö — säästät {eur(quote('import', true).discount)}
              </span>
              <span className="mt-1 block text-[13px] font-light leading-relaxed text-charcoal-mid">
                Tallennamme vain tilinpäätösluvut, jotta {companyName} voidaan arvioida myöhemmin
                uudelleen. Hinta {eur(quote('import', true).total)} normaalin{' '}
                {eur(quote('import', false).total)} sijaan.
              </span>
            </span>
          </label>
        )}

        <label className="mt-5 block">
          <span className="text-[13px] font-medium text-charcoal">
            Sähköposti raportin toimitusta varten
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nimi@yritys.fi"
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-steel focus:border-green"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-green px-5 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-green-deep disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? 'Siirrytään maksuun…' : `Siirry maksamaan — ${eur(total)}`}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-steel">
          <LockIcon /> Turvallinen maksu Stripen kautta. Ei vaadi käyttäjätiliä.
        </p>
        <p className="mt-3 border-t border-mist pt-3 text-center text-[11.5px] leading-relaxed text-steel">
          Raportti on analyysi päätöksenteon tueksi. Se ei ole tilintarkastus, fairness opinion
          eikä sijoitusneuvontaa.
        </p>
      </form>
    </aside>
  )
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
