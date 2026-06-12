import type { PageSection } from '@/content/schema'
import { Reveal } from '@/components/Reveal'
import { CheckIcon } from '@/components/icons'

type Props = Extract<PageSection, { type: 'pricing' }>

export function PricingSection({ eyebrow, title, subtitle, vatNote, plans }: Props) {
  return (
    <section id="hinnoittelu" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">{eyebrow}</p>
          <h2 className="mt-3 text-balance text-4xl font-light tracking-[-0.02em] text-charcoal lg:text-5xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-[17px] font-light leading-relaxed text-charcoal-mid">
            {subtitle}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 100}>
              <article
                className={`relative flex h-full flex-col rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'border border-green bg-forest text-white shadow-[0_24px_64px_rgba(27,48,40,0.35)]'
                    : 'border border-mist bg-white text-charcoal hover:border-green/40 hover:shadow-[0_20px_60px_rgba(26,36,32,0.1)]'
                }`}
              >
                {plan.badge ? (
                  <span className="absolute -top-3 left-7 rounded-full bg-gold px-3.5 py-1 text-[11.5px] font-semibold text-white shadow-[0_4px_12px_rgba(200,150,62,0.4)]">
                    {plan.badge}
                  </span>
                ) : null}
                <h3 className={`text-[15px] font-medium ${plan.highlighted ? 'text-green-light' : 'text-green-deep'}`}>
                  {plan.name}
                </h3>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-[2.2rem] font-light tracking-tight">{plan.price}</span>
                  {plan.priceSuffix && (
                    <span className={`text-sm ${plan.highlighted ? 'text-white/60' : 'text-steel'}`}>
                      {plan.priceSuffix}
                    </span>
                  )}
                </p>
                <p className={`mt-3 text-[14px] font-light leading-relaxed ${plan.highlighted ? 'text-white/75' : 'text-charcoal-mid'}`}>
                  {plan.description}
                </p>
                <ul className="mb-7 mt-5 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2.5 text-[13.5px] ${plan.highlighted ? 'text-white/85' : 'text-charcoal-mid'}`}>
                      <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? 'text-green-light' : 'text-green'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                {/* TODO(backend): replace anchors with Stripe checkout links per plan */}
                <a
                  href={plan.ctaHref}
                  className={`mt-auto block rounded-full px-5 py-3 text-center text-[14.5px] font-medium transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-green text-white hover:bg-green-light hover:text-forest'
                      : 'border border-mist text-charcoal hover:border-green hover:text-green-deep'
                  }`}
                >
                  {plan.ctaLabel}
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={250}>
          <p className="mt-10 text-center text-[13px] text-steel">{vatNote}</p>
        </Reveal>
      </div>
    </section>
  )
}
