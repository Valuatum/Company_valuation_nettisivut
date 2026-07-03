import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'

export const metadata: Metadata = {
  title: 'Maksu peruutettu | Valuatum Arvonmääritys',
  description: 'Maksua ei veloitettu. Voit jatkaa tilausta milloin tahansa.',
  robots: { index: false },
}

export default function KassaPeruutettuPage() {
  return (
    <section className="relative overflow-hidden bg-forest text-white">
      <div className="hero-pattern absolute inset-0" />
      <div className="hero-glow absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2" />
      <div className="relative mx-auto grid min-h-[calc(100svh-72px)] max-w-3xl place-items-center px-6 pb-20 pt-36 lg:pt-44">
        <Reveal className="text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-light">
            Kassa
          </p>
          <h1 className="mt-3 text-balance text-4xl font-light tracking-[-0.02em] lg:text-5xl">
            Maksu peruutettu
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-[17px] font-light leading-relaxed text-white/75">
            Maksua ei veloitettu. Voit jatkaa siitä mihin jäit, kun sinulle sopii —
            ilman kiirettä.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/yritys"
              className="rounded-full bg-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-deep"
            >
              Palaa yrityksen valintaan
            </Link>
            <Link
              href="/yritys"
              className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-light text-white/90 transition-colors hover:bg-white/10"
            >
              Tilaa raportti etusivulta
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
