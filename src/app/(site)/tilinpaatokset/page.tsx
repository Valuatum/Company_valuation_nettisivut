import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { CheckIcon } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Tilinpäätökset raporttia varten — lataa itse tai anna meidän hakea | Valuatum',
  description:
    'Jos yrityksesi tilinpäätöksiä ei löydy aineistostamme, voit ladata ne itse tai antaa meidän hakea viralliset tiedot puolestasi. Kummallakin tavalla saat saman arvonmääritysraportin.',
  alternates: { canonical: '/tilinpaatokset' },
}

const steps = [
  {
    title: 'Etsi yrityksesi ja valitse tapa',
    text: 'Hae yrityksesi Y-tunnuksella tai nimellä. Jos tilinpäätöksiä ei löydy valmiiksi, valitset ostohetkellä, lataatko ne itse vai haemmeko ne puolestasi.',
  },
  {
    title: 'Maksa turvallisesti',
    text: 'Maksu hoituu Stripen kautta, eikä tiliä tarvitse luoda. Hinta kattaa tilinpäätösten käsittelyn ja raportin laatimisen.',
  },
  {
    title: 'Toimita tilinpäätökset',
    text: 'Itse ladatessasi lisäät PDF-tiedostot heti maksun jälkeen. Hakupalvelua käyttäessäsi sinun ei tarvitse tehdä mitään — me hoidamme tietojen hankinnan.',
  },
  {
    title: 'Raportti sähköpostiisi',
    text: 'Poimimme luvut tilinpäätöksistä ja laadimme saman arvonmääritysraportin kuin aineistossamme valmiiksi oleville yrityksille. Valmis PDF toimitetaan sähköpostiisi.',
  },
]

export default function TilinpaatoksetPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="hero-pattern absolute inset-0" />
        <div className="hero-glow absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-36 lg:px-10 lg:pb-20 lg:pt-44">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-light">
              Tilinpäätökset
            </p>
            <h1 className="mt-4 max-w-3xl text-balance text-4xl font-light leading-[1.1] tracking-[-0.02em] sm:text-5xl">
              Eikö tilinpäätöksiä löydy valmiiksi? Kaksi tapaa saada raportti.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-[17px] font-light leading-relaxed text-white/70">
              Osaa yrityksistä ei ole valmiiksi aineistossamme. Silloin voit joko ladata
              yrityksesi tilinpäätökset itse tai antaa meidän hakea viralliset tiedot
              puolestasi. Lopputulos on sama arvonmääritysraportti kummallakin tavalla.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-off-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <article className="flex h-full flex-col rounded-3xl border border-mist bg-white p-8">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
                  Vaihtoehto 1 — edullisempi
                </p>
                <h2 className="mt-3 text-2xl font-light tracking-tight text-charcoal">
                  Lataa tilinpäätökset itse
                </h2>
                <p className="mt-3 text-[15px] font-light leading-relaxed text-charcoal-mid">
                  Jos sinulla on yrityksesi tilinpäätökset PDF-muodossa, lataat ne heti
                  maksun jälkeen. Tämä on edullisin tapa, koska tietojen hankinnasta ei
                  synny kuluja.
                </p>
                <ul className="mb-8 mt-5 space-y-2.5">
                  {[
                    'Viimeisen 3–5 vuoden tilinpäätökset PDF-tiedostoina',
                    'Lataus onnistuu heti maksun jälkeen, ilman tiliä',
                    'Halutessasi voit sallia lukujen anonyymin hyödyntämisen aineistossamme — saat siitä alennuksen',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-charcoal-mid">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/yritys"
                  className="mt-auto self-start rounded-full bg-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-deep"
                >
                  Etsi yrityksesi ja aloita
                </Link>
              </article>
            </Reveal>

            <Reveal delay={100}>
              <article className="flex h-full flex-col rounded-3xl border border-mist bg-white p-8">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
                  Vaihtoehto 2 — vaivattomin
                </p>
                <h2 className="mt-3 text-2xl font-light tracking-tight text-charcoal">
                  Me haemme tilinpäätökset puolestasi
                </h2>
                <p className="mt-3 text-[15px] font-light leading-relaxed text-charcoal-mid">
                  Jos tilinpäätöksiä ei ole käsillä, haemme viralliset tilinpäätöstiedot
                  Creditsafe-palvelusta. Sinun ei tarvitse etsiä tai skannata mitään —
                  tietojen hankinta sisältyy hintaan.
                </p>
                <ul className="mb-8 mt-5 space-y-2.5">
                  {[
                    'Viralliset tilinpäätöstiedot suoraan rekisterilähteestä',
                    'Ei omaa työtä — maksat ja odotat raporttia',
                    'Sama raportti ja sama laatu kuin itse ladatuilla tiedoilla',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-charcoal-mid">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/yritys"
                  className="mt-auto self-start rounded-full bg-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-deep"
                >
                  Etsi yrityksesi ja aloita
                </Link>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
                Näin se toimii
              </p>
              <div className="mt-6 space-y-5">
                {steps.map((s, i) => (
                  <div key={s.title} className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-mist text-[13px] font-semibold text-green-deep">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-[16px] font-medium text-charcoal">{s.title}</h3>
                      <p className="mt-1.5 text-[14.5px] font-light leading-relaxed text-charcoal-mid">
                        {s.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-3xl border border-mist bg-off-white p-8">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">
                  Mitä tiedostoja tarvitaan
                </p>
                <h2 className="mt-3 text-2xl font-light tracking-tight text-charcoal">
                  Viimeisen 3–5 vuoden tilinpäätökset PDF-muodossa
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {[
                    'Virallinen tilinpäätös: tuloslaskelma ja tase, mielellään liitetietoineen',
                    'Sähköinen tai skannattu PDF käy — poimimme luvut kummastakin',
                    'Enintään 10 tiedostoa, kukin enintään 20 Mt',
                    'Mitä useampi vuosi, sitä luotettavampi kuva kehityksestä',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14.5px] text-charcoal-mid">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[13px] leading-relaxed text-steel">
                  Raportti on analyysi päätöksenteon tueksi. Se ei ole tilintarkastus,
                  fairness opinion eikä sijoitusneuvontaa.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-off-white pb-24">
        <div className="mx-auto max-w-7xl px-6 pt-4 lg:px-10">
          <Reveal>
            <div className="rounded-3xl bg-forest p-8 text-white lg:p-12">
              <h2 className="text-balance text-3xl font-light tracking-tight">
                Aloita hakemalla yrityksesi
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] font-light leading-relaxed text-white/75">
                Haku kertoo heti, löytyvätkö tilinpäätökset valmiiksi. Jos eivät, valitset
                ostohetkellä itse latauksen tai tietojen haun — hinnat näet ennen maksua.
              </p>
              <Link
                href="/yritys"
                className="mt-6 inline-block rounded-full bg-green px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-green-deep"
              >
                Etsi yrityksesi
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
