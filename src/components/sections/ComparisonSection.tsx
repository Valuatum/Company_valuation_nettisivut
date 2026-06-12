import type { PageSection } from '@/content/schema'
import { Reveal } from '@/components/Reveal'
import { CheckIcon } from '@/components/icons'

type Props = Extract<PageSection, { type: 'comparison' }>

export function ComparisonSection({ eyebrow, title, intro, traditional, valuatum, footnote }: Props) {
  return (
    <section className="relative overflow-hidden bg-forest py-24 text-white lg:py-32">
      <div className="hero-pattern absolute inset-0" />
      <div className="hero-glow absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-light">{eyebrow}</p>
          <h2 className="mt-3 text-balance text-4xl font-light tracking-[-0.02em] lg:text-5xl">{title}</h2>
          <p className="mt-5 max-w-2xl text-pretty text-[17px] font-light leading-relaxed text-white/70">{intro}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal delay={100}>
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-8">
              <h3 className="text-lg font-medium text-white/60">{traditional.title}</h3>
              <ul className="mt-6 space-y-3.5">
                {traditional.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] font-light text-white/55">
                    <span className="mt-2 h-1 w-3 shrink-0 rounded-full bg-white/25" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={220}>
            <div className="relative h-full rounded-3xl border border-green/50 bg-gradient-to-b from-green/15 to-green/5 p-8 shadow-[0_0_0_1px_rgba(61,158,114,0.2),0_24px_64px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-medium text-white">{valuatum.title}</h3>
              <ul className="mt-6 space-y-3.5">
                {valuatum.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] font-light text-white/90">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green/30">
                      <CheckIcon className="h-3 w-3 text-green-light" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={300}>
          <p className="mt-10 text-center text-[15px] font-light italic text-white/55">{footnote}</p>
        </Reveal>
      </div>
    </section>
  )
}
