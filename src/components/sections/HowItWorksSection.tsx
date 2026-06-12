import type { PageSection } from '@/content/schema'
import { Reveal } from '@/components/Reveal'

type Props = Extract<PageSection, { type: 'howItWorks' }>

export function HowItWorksSection({ eyebrow, title, steps, note }: Props) {
  return (
    <section className="bg-off-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">{eyebrow}</p>
          <h2 className="mt-3 text-balance text-4xl font-light tracking-[-0.02em] text-charcoal lg:text-5xl">
            {title}
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.id} delay={index * 120} as="li">
              <div className="relative h-full">
                {index < steps.length - 1 && (
                  <span className="absolute left-12 top-6 hidden h-px w-[calc(100%-3rem)] bg-mist lg:block" aria-hidden />
                )}
                <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-green/30 bg-white text-lg font-medium text-green-deep shadow-[0_4px_16px_rgba(61,158,114,0.15)]">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-[16px] font-medium leading-snug text-charcoal">{step.title}</h3>
                <p className="mt-2.5 text-[14px] font-light leading-relaxed text-charcoal-mid">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={300}>
          <p className="mx-auto mt-14 max-w-2xl rounded-2xl border border-gold/30 bg-gold-faint px-6 py-4 text-center text-[14px] leading-relaxed text-charcoal-mid">
            {note}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
