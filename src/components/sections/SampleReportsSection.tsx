import type { PageSection } from '@/content/schema'
import { Reveal } from '@/components/Reveal'
import { ArrowRightIcon, DocumentIcon } from '@/components/icons'

type Props = Extract<PageSection, { type: 'sampleReports' }>

export function SampleReportsSection({ eyebrow, title, subtitle, ctaLabel, reports }: Props) {
  return (
    <section id="esimerkit" className="bg-off-white py-24 lg:py-32">
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

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reports.map((report, index) => (
            <Reveal key={report.id} delay={index * 120}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-mist bg-white transition-all duration-300 hover:-translate-y-1 hover:border-green/40 hover:shadow-[0_20px_60px_rgba(26,36,32,0.12)]">
                <div className="relative bg-forest p-6 pb-7">
                  <div className="hero-pattern absolute inset-0 opacity-60" />
                  <div className="relative">
                    <span className="inline-block rounded-full bg-green-mist px-3 py-1 text-[11.5px] font-semibold text-green-deep">
                      {report.tag}
                    </span>
                    <div className="mt-4 flex items-center gap-3">
                      <DocumentIcon className="h-8 w-8 text-green-light" />
                      <h3 className="text-lg font-medium leading-snug text-white">{report.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[15px] font-light leading-relaxed text-charcoal-mid">{report.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {report.features.map((feature) => (
                      <li key={feature} className="rounded-full border border-mist bg-off-white px-3 py-1 text-[12px] text-charcoal-mid">
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {/* TODO(backend): link to real sample report PDFs when available */}
                  <a
                    href={report.pdfUrl}
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-green-deep transition-colors duration-200 group-hover:text-green"
                  >
                    {ctaLabel}
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
