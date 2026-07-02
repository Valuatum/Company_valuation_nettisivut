'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { SECTOR_RANGES, getSector, type SectorKey } from '@/lib/marketMultiples'

const eurCompact = new Intl.NumberFormat('fi-FI', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

function fmt(value: number) {
  return eurCompact.format(value)
}

export function ValuationCalculator() {
  const [sector, setSector] = useState<SectorKey>('software')
  const [revenue, setRevenue] = useState(5_000_000)
  const [ebitdaMargin, setEbitdaMargin] = useState(16)
  const [netDebt, setNetDebt] = useState(500_000)

  const result = useMemo(() => {
    const s = getSector(sector)
    const ebitda = Math.max(0, revenue * (ebitdaMargin / 100))
    const evLow = ebitda * s.evEbitdaLow
    const evBase = ebitda * s.evEbitdaBase
    const evHigh = ebitda * s.evEbitdaHigh
    return {
      sector: s,
      ebitda,
      evLow,
      evHigh,
      equityLow: Math.max(0, evLow - netDebt),
      equityBase: Math.max(0, evBase - netDebt),
      equityHigh: Math.max(0, evHigh - netDebt),
    }
  }, [sector, revenue, ebitdaMargin, netDebt])

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-3xl border border-mist bg-white p-6 md:p-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
          Syötä luvut
        </p>
        <div className="mt-6 space-y-6">
          <label className="block">
            <span className="text-sm font-medium text-charcoal">Toimiala</span>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorKey)}
              className="mt-2 w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-green focus:ring-4 focus:ring-green/15"
            >
              {SECTOR_RANGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <NumberField label="Liikevaihto" value={revenue} min={0} step={250_000} suffix="EUR" onChange={setRevenue} />
          <NumberField
            label="Käyttökate-% (EBITDA)"
            value={ebitdaMargin}
            min={0}
            max={60}
            step={1}
            suffix="%"
            onChange={setEbitdaMargin}
          />
          <NumberField label="Nettovelka" value={netDebt} min={-5_000_000} step={100_000} suffix="EUR" onChange={setNetDebt} />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-mist bg-white">
        <div className="bg-forest p-7 text-white">
          <p className="text-sm font-light text-white/60">Suuntaa-antava arvohaarukka (osakekanta)</p>
          <p className="mt-3 text-4xl font-light leading-none tracking-tight md:text-5xl">
            {fmt(result.equityLow)} – {fmt(result.equityHigh)}
          </p>
          <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/70">
            Perustuu kertoimiin {result.sector.evEbitdaLow}x–{result.sector.evEbitdaHigh}x käyttökatteesta
            toimialalla {result.sector.label.toLowerCase()}.
          </p>
        </div>

        <div className="grid gap-px bg-mist md:grid-cols-3">
          <Metric label="Käyttökate (EBITDA)" value={fmt(result.ebitda)} />
          <Metric label="Yritysarvo (EV)" value={`${fmt(result.evLow)} – ${fmt(result.evHigh)}`} />
          <Metric label="Perusarvio (osakekanta)" value={fmt(result.equityBase)} />
        </div>

        <div className="border-t border-mist p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <Note title="Mihin haarukka sopii">
              Nopea markkinakerroinnäkymä, joka auttaa hahmottamaan kokoluokan ennen varsinaista
              arvonmääritystä.
            </Note>
            <Note title="Mitä se ei kerro">
              Laskuri ei huomioi yrityskohtaisia riskejä, käyttöpääomaa, kassavirtaennusteita eikä
              tilinpäätöksen laatua.
            </Note>
          </div>

          <div className="mt-7 rounded-2xl bg-green-faint p-5">
            <p className="text-sm leading-relaxed text-charcoal/80">
              Tulos on suuntaa-antava haarukka — se ei korvaa varsinaista arvonmääritysraporttia.
              Raportti on analyysi päätöksenteon tueksi, ei tilintarkastus, fairness opinion tai
              sijoitusneuvontaa.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/#tilaa"
                className="rounded-full bg-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-deep"
              >
                Tilaa arvonmääritysraportti
              </Link>
              <Link
                href="/kertoimet"
                className="rounded-full border border-mist px-5 py-2.5 text-sm font-medium text-charcoal transition-colors hover:border-green hover:text-green-deep"
              >
                Katso kertoimien taustat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max?: number
  step: number
  suffix: string
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-charcoal">{label}</span>
        <span className="text-sm font-medium text-green-deep">
          {suffix === '%' ? `${value} %` : fmt(value)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max ?? 30_000_000}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-green"
      />
    </label>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className="mt-2 text-lg font-medium text-charcoal">{value}</p>
    </div>
  )
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t-2 border-green/40 pt-4">
      <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-charcoal/70">{children}</p>
    </div>
  )
}
