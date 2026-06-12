import type { PageSection } from '@/content/schema'
import { Reveal } from '@/components/Reveal'
import { UseCaseIcon } from '@/components/icons'

type Props = Extract<PageSection, { type: 'useCases' }>

export function UseCasesSection({ eyebrow, title, cases }: Props) {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">{eyebrow}</p>
          <h2 className="mt-3 text-balance text-4xl font-light tracking-[-0.02em] text-charcoal lg:text-5xl">
            {title}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((useCase, index) => (
            <Reveal key={useCase.id} delay={(index % 3) * 100}>
              <article className="group h-full rounded-3xl border border-mist bg-off-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-green/40 hover:bg-white hover:shadow-[0_20px_60px_rgba(26,36,32,0.1)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-mist text-green-deep transition-colors duration-300 group-hover:bg-green group-hover:text-white">
                  <UseCaseIcon name={useCase.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-[17px] font-medium leading-snug text-charcoal">{useCase.title}</h3>
                <p className="mt-3 text-[14.5px] font-light leading-relaxed text-charcoal-mid">
                  {useCase.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
