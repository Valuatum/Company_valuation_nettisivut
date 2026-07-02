import type { Metadata } from 'next'
import { CompanySearch } from '@/components/CompanySearch'
import { Reveal } from '@/components/Reveal'

export const metadata: Metadata = {
  title: 'Yrityshaku — tilaa arvonmääritysraportti | Valuatum',
  description:
    'Hae yritys nimellä tai Y-tunnuksella ja tilaa tekoälyavusteinen arvonmääritysraportti. DCF, verrokkianalyysi ja riskiarvio yhdessä PDF-raportissa.',
  alternates: { canonical: '/yritys' },
}

const STEPS = [
  {
    number: '01',
    title: 'Hae yritys',
    text: 'Etsi yritys nimellä tai Y-tunnuksella. Näet heti, ovatko tilinpäätöstiedot jo hallussamme.',
  },
  {
    number: '02',
    title: 'Valitse tietolähde',
    text: 'Jos tiedot ovat valmiina, raportti laaditaan heti maksun jälkeen. Muussa tapauksessa lataat tilinpäätökset itse tai haemme ne puolestasi.',
  },
  {
    number: '03',
    title: 'Saat raportin sähköpostiisi',
    text: 'Maksun jälkeen raportti laaditaan ja toimitetaan sähköpostiisi PDF-muodossa.',
  },
]

export default function YritysPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="hero-pattern absolute inset-0" />
        <div className="hero-glow absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-36 lg:px-10 lg:pb-24 lg:pt-44">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-light">
              Yrityshaku
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-3 max-w-3xl text-balance text-4xl font-light leading-[1.1] tracking-[-0.02em] lg:text-5xl">
              Hae yritys ja tilaa arvonmääritysraportti
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 max-w-2xl text-pretty text-[17px] font-light leading-relaxed text-white/75">
              Etsi yritys nimellä tai Y-tunnuksella. Näet suoraan, ovatko tilinpäätöstiedot jo
              hallussamme ja mitä raporttivaihtoehtoja yritykselle on saatavilla.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-8 max-w-2xl">
              <CompanySearch variant="dark" autoFocus />
              <p className="mt-4 text-[13px] text-white/55">
                Jos yritystä ei löydy hausta, voit silti tilata raportin etusivun lomakkeella.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-off-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
              Näin se toimii
            </p>
            <h2 className="mt-3 max-w-2xl text-balance text-3xl font-light tracking-[-0.02em] text-charcoal lg:text-4xl">
              Hausta valmiiseen raporttiin kolmessa vaiheessa
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.number} delay={index * 100}>
                <article className="h-full rounded-3xl border border-mist bg-white p-7">
                  <span className="text-[13px] font-semibold text-green">{step.number}</span>
                  <h3 className="mt-3 text-lg font-medium tracking-tight text-charcoal">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] font-light leading-relaxed text-charcoal-mid">
                    {step.text}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <p className="mt-10 max-w-2xl text-[13px] leading-relaxed text-steel">
              Raportti on analyysi päätöksenteon tueksi. Se ei ole tilintarkastus, fairness opinion
              eikä sijoitusneuvontaa.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
