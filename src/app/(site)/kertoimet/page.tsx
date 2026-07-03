import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { SECTOR_RANGES, WISDOM_PEERS } from '@/lib/marketMultiples'

export const metadata: Metadata = {
  title: 'Arvostuskertoimet toimialoittain – EV/EBITDA ja EV/Liikevaihto',
  description:
    'Suuntaa-antavat arvostuskertoimet toimialoittain: EV/EBITDA- ja EV/Liikevaihto-haarukat sekä listattujen verrokkien tunnusluvut yrityksen arvonmäärityksen tueksi.',
  alternates: { canonical: '/kertoimet' },
  openGraph: {
    title: 'Arvostuskertoimet toimialoittain – EV/EBITDA ja EV/Liikevaihto',
    description:
      'Toimialakohtaiset arvostuskertoimet ja listattujen verrokkien tunnusluvut arvonmäärityksen tueksi.',
    type: 'article',
  },
}

const MULTIPLE_DEFINITIONS = [
  {
    term: 'EV/EBITDA',
    text: 'Yritysarvo (velaton arvo) jaettuna käyttökatteella. Yleisin yrityskaupoissa käytetty kerroin, koska se ei riipu rahoitusrakenteesta tai poistokäytännöistä. Osakekannan arvo saadaan vähentämällä yritysarvosta nettovelka.',
  },
  {
    term: 'EV/Liikevaihto',
    text: 'Yritysarvo suhteessa liikevaihtoon. Käytetään erityisesti silloin, kun kannattavuus on vielä kehittymässä tai vaihtelee vuosittain — esimerkiksi kasvavissa ohjelmistoyhtiöissä.',
  },
]

export default function KertoimetPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="hero-pattern absolute inset-0" aria-hidden="true" />
        <div className="hero-glow absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-32 lg:px-10 lg:pb-20 lg:pt-40">
          <Reveal className="max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-light">
              Toimialakertoimet
            </p>
            <h1 className="mt-4 text-balance text-4xl font-light tracking-[-0.02em] lg:text-5xl">
              Arvostuskertoimet toimialoittain
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-[17px] font-light leading-relaxed text-white/75">
              Listatut verrokkiyhtiöt eivät ole täydellisiä vertailukohtia listaamattomalle
              yritykselle, mutta ne auttavat rajaamaan käyttökelpoisen ensihaarukan — kunhan
              rajoitteet ovat selvillä.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
              Mitä kertoimet tarkoittavat
            </p>
            <h2 className="mt-3 text-balance text-3xl font-light tracking-[-0.02em] text-charcoal lg:text-4xl">
              Kaksi yleisintä kerrointa lyhyesti.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {MULTIPLE_DEFINITIONS.map((d, i) => (
              <Reveal key={d.term} delay={i * 100}>
                <article className="h-full rounded-3xl border border-mist bg-white p-7">
                  <h3 className="text-[17px] font-medium text-forest">{d.term}</h3>
                  <p className="mt-3 text-[14.5px] font-light leading-relaxed text-charcoal/75">{d.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-off-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
              Suuntaa-antavat haarukat
            </p>
            <h2 className="mt-3 text-balance text-3xl font-light tracking-[-0.02em] text-charcoal lg:text-4xl">
              Laskurin käyttämät toimialahaarukat.
            </h2>
            <p className="mt-5 text-pretty text-[16px] font-light leading-relaxed text-charcoal-mid">
              Haarukat on tarkoituksella pidetty leveinä. Ne on tarkoitettu kokoluokan
              hahmottamiseen — varsinainen raportti tarkentaa arvion yrityskohtaisella analyysilla.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {SECTOR_RANGES.map((s, i) => (
              <Reveal key={s.key} delay={i * 100}>
                <article className="flex h-full flex-col rounded-3xl border border-mist bg-white p-6 transition-all duration-300 hover:border-green/40 hover:shadow-[0_20px_60px_rgba(26,36,32,0.08)]">
                  <h3 className="text-[15px] font-medium text-forest">{s.label}</h3>
                  <p className="mt-2 min-h-16 text-[13.5px] font-light leading-relaxed text-charcoal/70">
                    {s.description}
                  </p>
                  <div className="mt-auto border-t border-mist pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">
                      EV/EBITDA
                    </p>
                    <p className="mt-2 text-3xl font-light tracking-tight text-charcoal">
                      {s.evEbitdaLow}x–{s.evEbitdaHigh}x
                    </p>
                    <p className="mt-3 text-xs text-steel">
                      EV/Liikevaihto: {s.revenueLow}x–{s.revenueHigh}x
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-mist bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
              Listatut verrokit
            </p>
            <h2 className="mt-3 text-balance text-3xl font-light tracking-[-0.02em] text-charcoal lg:text-4xl">
              Esimerkkejä haarukoiden taustalla olevista yhtiöistä.
            </h2>
            <p className="mt-5 text-pretty text-[16px] font-light leading-relaxed text-charcoal-mid">
              Verrokkiotos perustuu Valuatum Wisdom -konsensusennusteisiin ja pörssikursseihin
              kapeasta pohjoismaisesta listatusta universumista. Luvut miljoonina euroina,
              osakekurssit euroina.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-10 overflow-x-auto rounded-3xl border border-mist bg-white">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-forest text-white">
                  <tr>
                    <Th>Yhtiö</Th>
                    <Th>Toimiala</Th>
                    <Th>Kurssi</Th>
                    <Th>Liikevaihto 2026e</Th>
                    <Th>EBITDA 2026e</Th>
                    <Th>EBITDA-%</Th>
                    <Th>Päivitetty</Th>
                  </tr>
                </thead>
                <tbody>
                  {WISDOM_PEERS.map((p) => (
                    <tr key={p.ticker} className="border-t border-mist">
                      <Td>
                        <span className="font-medium text-charcoal">{p.company}</span>
                        <span className="mt-1 block text-xs text-steel">{p.ticker}</span>
                      </Td>
                      <Td>{p.sector}</Td>
                      <Td>{p.price}</Td>
                      <Td>{p.sales2026.toLocaleString('fi-FI', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</Td>
                      <Td>{p.ebitda2026.toLocaleString('fi-FI', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</Td>
                      <Td>{p.ebitdaMargin.toLocaleString('fi-FI', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</Td>
                      <Td>{p.updated}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <p className="mt-6 max-w-3xl text-[13px] font-light leading-relaxed text-charcoal/60">
              Huomio rehellisyyden nimissä: listattujen yhtiöiden kertoimet yliarvioivat usein
              listaamattoman yhtiön arvoa, koska pörssiyhtiöillä on parempi likviditeetti, suurempi
              koko, laajempi raportointi ja helpompi pääsy rahoitukseen. Varsinainen raportti
              täydentää markkinakertoimet kassavirta-analyysillä (DCF), tilinpäätöksen laadun
              arvioinnilla ja riskianalyysillä. Kertoimet ja verrokkitiedot ovat suuntaa-antavia
              eivätkä sijoitusneuvontaa.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center lg:px-10">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
              Ota haarukat käyttöön
            </p>
            <h2 className="mt-3 text-3xl font-light tracking-[-0.02em] text-charcoal">
              Kokeile laskuria — ja tilaa sitten varsinainen raportti.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/laskuri"
                className="rounded-full bg-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-deep"
              >
                Avaa laskuri
              </Link>
              <Link
                href="/yritys"
                className="rounded-full border border-mist px-5 py-2.5 text-sm font-medium text-charcoal transition-colors hover:border-green hover:text-green-deep"
              >
                Tilaa raportti
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-4 align-top text-charcoal/75">{children}</td>
}
