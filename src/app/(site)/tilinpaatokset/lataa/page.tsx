import type { Metadata } from 'next'
import Link from 'next/link'
import { UploadForm } from '@/components/UploadForm'

export const metadata: Metadata = {
  title: 'Lataa tilinpäätökset | Valuatum',
  description: 'Lataa yrityksesi tilinpäätökset PDF-muodossa arvonmääritysraporttia varten.',
  robots: { index: false },
}

export default async function LataaPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; demo?: string }>
}) {
  const { session_id, demo } = await searchParams
  const paid = Boolean(session_id || demo)

  return (
    <>
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="hero-pattern absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-36 lg:px-10 lg:pb-16 lg:pt-44">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-light">
            Tilinpäätösten lataus
          </p>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-light leading-[1.1] tracking-[-0.02em] sm:text-5xl">
            Lataa viimeisen 3–5 vuoden tilinpäätökset
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-[17px] font-light leading-relaxed text-white/70">
            Lisää viralliset tilinpäätökset PDF-tiedostoina. Poimimme luvut ja laadimme
            arvonmääritysraportin, joka toimitetaan sähköpostiisi.
          </p>
        </div>
      </section>

      <section className="bg-off-white py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-0">
          {paid ? (
            <p className="mb-8 rounded-2xl border border-green/30 bg-green-faint px-5 py-4 text-sm font-medium text-green-deep">
              Maksu vastaanotettu. Tiliä ei tarvita — lataa tiedostot alle.
            </p>
          ) : (
            <p className="mb-8 rounded-2xl border border-gold/40 bg-gold-faint px-5 py-4 text-sm leading-relaxed text-charcoal">
              Emme voineet vahvistaa maksua tälle istunnolle. Jos päädyit tänne vahingossa,
              aloita{' '}
              <Link href="/tilinpaatokset" className="font-semibold text-green-deep underline">
                tilinpäätössivulta
              </Link>
              .
            </p>
          )}

          <UploadForm sessionId={session_id ?? null} />
        </div>
      </section>
    </>
  )
}
