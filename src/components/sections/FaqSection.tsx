'use client'

import { useState } from 'react'
import type { PageSection } from '@/content/schema'
import { Reveal } from '@/components/Reveal'
import { ChevronDownIcon } from '@/components/icons'

type Props = Extract<PageSection, { type: 'faq' }>

export function FaqSection({ eyebrow, title, items }: Props) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  return (
    <section id="ukk" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <Reveal className="text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-green-deep">{eyebrow}</p>
          <h2 className="mt-3 text-balance text-4xl font-light tracking-[-0.02em] text-charcoal lg:text-5xl">
            {title}
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {items.map((item, index) => {
            const open = openId === item.id
            return (
              <Reveal key={item.id} delay={Math.min(index * 60, 300)}>
                <div
                  className={`faq-item rounded-2xl border transition-colors duration-300 ${
                    open ? 'border-green/40 bg-green-faint' : 'border-mist bg-white hover:border-green/30'
                  }`}
                  data-open={open}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    <span className="text-[15.5px] font-medium text-charcoal">{item.question}</span>
                    <ChevronDownIcon className="faq-chevron h-5 w-5 shrink-0 text-green-deep" />
                  </button>
                  <div className="faq-answer">
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-[14.5px] font-light leading-relaxed text-charcoal-mid">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
