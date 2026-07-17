import type { Metadata } from 'next'
import { getPageContent, getSiteSettings } from '@/content/server'
import { safeJsonLd } from '@/lib/jsonld'
import { ComparisonSection } from '@/components/sections/ComparisonSection'
import { FaqSection } from '@/components/sections/FaqSection'
import { FeatureGridSection } from '@/components/sections/FeatureGridSection'
import { FinalCtaSection } from '@/components/sections/FinalCtaSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { MethodologySection } from '@/components/sections/MethodologySection'
import { PricingSection } from '@/components/sections/PricingSection'
import { SampleReportsSection } from '@/components/sections/SampleReportsSection'
import { UseCasesSection } from '@/components/sections/UseCasesSection'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent('fi', 'home')
  return {
    title: page.metadata.title,
    description: page.metadata.description,
  }
}

function jsonLd(page: Awaited<ReturnType<typeof getPageContent>>) {
  const faq = page.sections.find((s) => s.type === 'faq') as
    | { items?: { question: string; answer: string }[] }
    | undefined
  const graph: object[] = [
    {
      '@type': 'Organization',
      name: 'Valuatum Oy',
      url: 'https://valuation.fi',
      logo: 'https://valuation.fi/logo.svg',
      email: 'company-valuation@valuatum.com',
      sameAs: ['https://www.valuatum.com'],
    },
    {
      '@type': 'Service',
      name: 'AI-arvonmääritysraportti',
      serviceType: 'Yrityksen arvonmääritys',
      areaServed: 'FI',
      provider: { '@type': 'Organization', name: 'Valuatum Oy' },
      description:
        'AI-avusteinen yrityksen arvonmääritysraportti suomalaiselle yritykselle: arvio yrityksen arvosta, arvostusväli, käytetyt ja hylätyt menetelmät, skenaariot, riskit ja arvon ajurit PDF-muodossa.',
      offers: {
        '@type': 'Offer',
        price: '79',
        priceCurrency: 'EUR',
        description: 'Yksittäinen raportti, 79 € + alv (aloitushinta)',
      },
    },
  ]
  if (faq?.items?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.items.map((i) => ({
        '@type': 'Question',
        name: i.question,
        acceptedAnswer: { '@type': 'Answer', text: i.answer },
      })),
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

export default async function HomePage() {
  const [page, site] = await Promise.all([getPageContent('fi', 'home'), getSiteSettings()])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd(page)) }}
      />
      {page.sections
        .filter((section) => section.visible)
        .map((section) => {
          switch (section.type) {
            case 'hero':
              return <HeroSection key={section.id} {...section} contactEmail={site.contactEmail} />
            case 'sampleReports':
              return <SampleReportsSection key={section.id} {...section} />
            case 'featureGrid':
              return <FeatureGridSection key={section.id} {...section} />
            case 'comparison':
              return <ComparisonSection key={section.id} {...section} />
            case 'useCases':
              return <UseCasesSection key={section.id} {...section} />
            case 'howItWorks':
              return <HowItWorksSection key={section.id} {...section} />
            case 'pricing':
              return <PricingSection key={section.id} {...section} />
            case 'methodology':
              return <MethodologySection key={section.id} {...section} />
            case 'faq':
              return <FaqSection key={section.id} {...section} />
            case 'finalCta':
              return <FinalCtaSection key={section.id} {...section} />
          }
        })}
    </>
  )
}
