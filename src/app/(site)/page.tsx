import type { Metadata } from 'next'
import { getPageContent, getSiteSettings } from '@/content/server'
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

export default async function HomePage() {
  const [page, site] = await Promise.all([getPageContent('fi', 'home'), getSiteSettings()])

  return (
    <>
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
