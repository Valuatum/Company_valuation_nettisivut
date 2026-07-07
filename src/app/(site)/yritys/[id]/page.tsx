import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCompany } from '@/lib/companies'
import { BuyBox } from '@/components/BuyBox'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const company = await getCompany(id)
  if (!company) return { title: 'Yritystä ei löytynyt | Valuatum' }
  return {
    title: `${company.name} — yrityksen arvonmääritys | Valuatum`,
    description: `Tilaa tekoälyavusteinen arvonmääritysraportti yritykselle ${company.name} (${company.businessId}). DCF, verrokkianalyysi ja riskiarvio yhdessä PDF-raportissa.`,
  }
}

function fmtEur(n?: number) {
  if (!n) return '–'
  return `${new Intl.NumberFormat('fi-FI', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)} €`
}

const FEATURES = [
  'Yrityksen ja liiketoiminnan yleiskuvaus',
  'Viiden vuoden normalisoidut tilinpäätösluvut',
  'DCF-arvonmääritys oletuksineen',
  'Verrokkiyhtiöt ja arvostuskertoimet',
  'Käänteinen arvonmääritys',
  'Skenaarioanalyysi',
  'Riskiarvio ja pisteytys',
  'Perusteltu arvohaarukka',
]

export default async function CompanyPage({ params }: { params: Params }) {
  const { id } = await params
  const company = await getCompany(id)
  if (!company) notFound()

  return (
    <>
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="hero-pattern absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-32 lg:px-10 lg:pb-16 lg:pt-40">
          <Link
            href="/yritys"
            className="text-sm text-white/50 transition-colors hover:text-white"
          >
            ← Takaisin hakuun
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <h1 className="text-balance text-4xl font-light leading-[1.1] tracking-[-0.02em] lg:text-5xl">
              {company.name}
            </h1>
            {company.hasFinancials ? (
              <span className="rounded-full border border-green-light/30 bg-green/15 px-3.5 py-1.5 text-[12.5px] font-medium text-green-light">
                Tilinpäätöstiedot valmiina
              </span>
            ) : (
              <span className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[12.5px] font-medium text-white/70">
                Tilinpäätöstiedot puuttuvat
              </span>
            )}
          </div>
          <p className="mt-4 text-[15px] font-light text-white/60">
            Y-tunnus {company.businessId} · {company.city} · {company.industry}
          </p>
        </div>
      </section>

      <section className="bg-off-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_400px] lg:px-10">
          <div>
            <Reveal>
              <dl className="grid gap-px overflow-hidden rounded-3xl border border-mist bg-mist sm:grid-cols-4">
                <Fact label="Y-tunnus" value={company.businessId} />
                <Fact label="Kotipaikka" value={company.city} />
                <Fact label="Toimiala" value={company.industry} />
                <Fact label="Liikevaihto" value={fmtEur(company.latestRevenueEur)} />
              </dl>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-8 rounded-3xl border border-mist bg-white p-8">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
                  Raportin sisältö
                </p>
                <h2 className="mt-3 text-3xl font-light tracking-[-0.02em] text-charcoal">
                  Mitä raportti sisältää
                </h2>
                <p className="mt-4 max-w-2xl text-[15px] font-light leading-relaxed text-charcoal-mid">
                  Jäsennelty PDF-muotoinen arvonmääritysraportti yrityksestä {company.name} —
                  perusteltu analyysi, ei pelkkä tunnuslukukooste.
                </p>
                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex gap-3 rounded-2xl border border-mist bg-off-white px-4 py-3 text-sm text-charcoal"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-7 border-t border-mist pt-4 text-[13px] leading-relaxed text-steel">
                  Raportti on analyysi päätöksenteon tueksi. Se ei ole tilintarkastus, fairness
                  opinion eikä sijoitusneuvontaa.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150} className="lg:sticky lg:top-28 lg:self-start">
            <BuyBox
              companyId={company.id}
              companyName={company.name}
              businessId={company.businessId}
              hasFinancials={company.hasFinancials}
            />
          </Reveal>
        </div>
      </section>
    </>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-steel">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-charcoal">{value}</dd>
    </div>
  )
}
