import Image from 'next/image'
import type { PageSection } from '@/content/schema'
import { Reveal } from '@/components/Reveal'

type Props = Extract<PageSection, { type: 'methodology' }>

export function MethodologySection({ eyebrow, title, intro, points, stats, disclaimer, image }: Props) {
  return (
    <section id="menetelma" className="bg-off-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-start gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">{eyebrow}</p>
              <h2 className="mt-3 text-balance text-4xl font-light tracking-[-0.02em] text-charcoal lg:text-5xl">
                {title}
              </h2>
              <p className="mt-5 max-w-2xl text-pretty text-[17px] font-light leading-relaxed text-charcoal-mid">
                {intro}
              </p>
            </Reveal>

            <div className="mt-10 space-y-6">
              {points.map((point, index) => (
                <Reveal key={point.id} delay={index * 100}>
                  <div className="flex gap-4">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green" />
                    <div>
                      <h3 className="text-[16px] font-medium text-charcoal">{point.title}</h3>
                      <p className="mt-1.5 text-[14.5px] font-light leading-relaxed text-charcoal-mid">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={300}>
              <p className="mt-10 rounded-2xl border border-mist bg-white px-6 py-4 text-[13.5px] leading-relaxed text-steel">
                {disclaimer}
              </p>
            </Reveal>
          </div>

          <div className="lg:sticky lg:top-28">
            <Reveal delay={150}>
              <div className="relative overflow-hidden rounded-3xl shadow-[0_24px_64px_rgba(26,36,32,0.18)]">
                <Image
                  src={image}
                  alt="Analyytikkotiimi työskentelee neuvotteluhuoneessa"
                  width={720}
                  height={480}
                  className="h-72 w-full object-cover lg:h-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-sm font-medium text-white">Valuatum Oy · Helsinki</p>
                  <p className="text-[12.5px] text-white/70">Arvonmääritys- ja analyysijärjestelmiä vuodesta 2000</p>
                </div>
              </div>
            </Reveal>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <Reveal key={stat.id} delay={200 + index * 100}>
                  <div className="h-full rounded-2xl border border-mist bg-white p-5 text-center">
                    <p className="text-[1.7rem] font-light tracking-tight text-green-deep">{stat.value}</p>
                    <p className="mt-1 text-[11.5px] leading-snug text-steel">{stat.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
