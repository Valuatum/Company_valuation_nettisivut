import Image from 'next/image'
import type { PageSection } from '@/content/schema'
import { Reveal } from '@/components/Reveal'

type Props = Extract<PageSection, { type: 'finalCta' }>

export function FinalCtaSection({ title, copy, cta, secondaryCta }: Props) {
  return (
    <section className="relative overflow-hidden bg-forest py-24 text-white lg:py-32">
      <Image
        src="/images/contract.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest via-forest/80 to-forest" />
      <div className="hero-glow absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
        <Reveal>
          <h2 className="text-balance text-4xl font-light tracking-[-0.02em] lg:text-5xl">{title}</h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-[17px] font-light leading-relaxed text-white/75">
            {copy}
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={cta.href}
              className="rounded-full bg-green px-8 py-3.5 text-[15.5px] font-medium text-white transition-all duration-200 hover:bg-green-light hover:text-forest hover:shadow-[0_8px_32px_rgba(61,158,114,0.45)]"
            >
              {cta.label}
            </a>
            <a
              href={secondaryCta.href}
              className="rounded-full border border-white/25 px-8 py-3.5 text-[15.5px] font-medium text-white/85 transition-colors duration-200 hover:border-white hover:text-white"
            >
              {secondaryCta.label}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
