import type { PageSection } from '@/content/schema'
import { Reveal } from '@/components/Reveal'
import { CheckIcon } from '@/components/icons'

type Props = Extract<PageSection, { type: 'featureGrid' }>

export function FeatureGridSection({ eyebrow, title, subtitle, items }: Props) {
  return (
    <section id="sisalto" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">{eyebrow}</p>
          <h2 className="mt-3 text-balance text-4xl font-light tracking-[-0.02em] text-charcoal lg:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-[17px] font-light leading-relaxed text-charcoal-mid">
            {subtitle}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={(index % 3) * 80}>
              <div className="flex h-full items-start gap-3.5 rounded-2xl border border-mist bg-white p-5 transition-all duration-300 hover:border-green/40 hover:bg-green-faint">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-mist">
                  <CheckIcon className="h-3.5 w-3.5 text-green-deep" />
                </span>
                <div>
                  <p className="text-[15px] font-normal leading-snug text-charcoal">{item.title}</p>
                  <p className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-steel">{item.group}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
