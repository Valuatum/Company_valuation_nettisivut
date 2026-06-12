import { z } from 'zod'

export const localeSchema = z.enum(['fi'])
export type Locale = z.infer<typeof localeSchema>

export const pageKeySchema = z.enum(['home'])
export type PageKey = z.infer<typeof pageKeySchema>

const sectionBaseSchema = z.object({
  id: z.string(),
  visible: z.boolean().default(true),
})

const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
})

const heroSectionSchema = sectionBaseSchema.extend({
  type: z.literal('hero'),
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  trustLine: z.string(),
  inputPlaceholder: z.string(),
  emailPlaceholder: z.string(),
  cta: z.string(),
  secondaryCta: linkSchema,
  formNote: z.string(),
  statusNote: z.string(),
  badges: z.array(z.object({ id: z.string(), label: z.string() })),
  mockup: z.object({
    reportLabel: z.string(),
    company: z.string(),
    businessId: z.string(),
    valueLabel: z.string(),
    value: z.string(),
    rangeLabel: z.string(),
    rangeLow: z.string(),
    rangeHigh: z.string(),
    methodsLabel: z.string(),
    methods: z.array(
      z.object({ id: z.string(), name: z.string(), weight: z.number() })
    ),
    risksLabel: z.string(),
    risks: z.array(z.string()),
    footnote: z.string(),
  }),
})

const sampleReportsSectionSchema = sectionBaseSchema.extend({
  type: z.literal('sampleReports'),
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  ctaLabel: z.string(),
  reports: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      tag: z.string(),
      description: z.string(),
      features: z.array(z.string()),
      // TODO(backend): replace with real sample report PDF URLs
      pdfUrl: z.string(),
    })
  ),
})

const featureGridSectionSchema = sectionBaseSchema.extend({
  type: z.literal('featureGrid'),
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      group: z.string(),
    })
  ),
})

const comparisonSectionSchema = sectionBaseSchema.extend({
  type: z.literal('comparison'),
  eyebrow: z.string(),
  title: z.string(),
  intro: z.string(),
  traditional: z.object({
    title: z.string(),
    items: z.array(z.string()),
  }),
  valuatum: z.object({
    title: z.string(),
    items: z.array(z.string()),
  }),
  footnote: z.string(),
})

const useCasesSectionSchema = sectionBaseSchema.extend({
  type: z.literal('useCases'),
  eyebrow: z.string(),
  title: z.string(),
  cases: z.array(
    z.object({
      id: z.string(),
      icon: z.string(),
      title: z.string(),
      description: z.string(),
    })
  ),
})

const howItWorksSectionSchema = sectionBaseSchema.extend({
  type: z.literal('howItWorks'),
  eyebrow: z.string(),
  title: z.string(),
  steps: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
    })
  ),
  note: z.string(),
})

const pricingSectionSchema = sectionBaseSchema.extend({
  type: z.literal('pricing'),
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  vatNote: z.string(),
  plans: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.string(),
      priceSuffix: z.string(),
      badge: z.string(),
      description: z.string(),
      features: z.array(z.string()),
      ctaLabel: z.string(),
      // TODO(backend): wire to Stripe checkout per plan
      ctaHref: z.string(),
      highlighted: z.boolean(),
    })
  ),
})

const methodologySectionSchema = sectionBaseSchema.extend({
  type: z.literal('methodology'),
  eyebrow: z.string(),
  title: z.string(),
  intro: z.string(),
  points: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
    })
  ),
  stats: z.array(
    z.object({
      id: z.string(),
      value: z.string(),
      label: z.string(),
    })
  ),
  disclaimer: z.string(),
  image: z.string(),
})

const faqSectionSchema = sectionBaseSchema.extend({
  type: z.literal('faq'),
  eyebrow: z.string(),
  title: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
    })
  ),
})

const finalCtaSectionSchema = sectionBaseSchema.extend({
  type: z.literal('finalCta'),
  title: z.string(),
  copy: z.string(),
  cta: linkSchema,
  secondaryCta: linkSchema,
})

export const pageSectionSchema = z.discriminatedUnion('type', [
  heroSectionSchema,
  sampleReportsSectionSchema,
  featureGridSectionSchema,
  comparisonSectionSchema,
  useCasesSectionSchema,
  howItWorksSectionSchema,
  pricingSectionSchema,
  methodologySectionSchema,
  faqSectionSchema,
  finalCtaSectionSchema,
])
export type PageSection = z.infer<typeof pageSectionSchema>

export const pageContentSchema = z.object({
  key: pageKeySchema,
  locale: localeSchema,
  route: z.string(),
  metadata: z.object({ title: z.string(), description: z.string() }),
  sections: z.array(pageSectionSchema),
})
export type PageContent = z.infer<typeof pageContentSchema>

const themeTokensSchema = z.record(z.string(), z.string())

export const siteSettingsSchema = z.object({
  siteId: z.literal('valuatum-arvonmaaritys'),
  name: z.string(),
  defaultLocale: localeSchema,
  theme: themeTokensSchema,
  navLinks: z.array(z.object({ id: z.string(), label: z.string(), href: z.string() })),
  navCta: z.object({ label: z.string(), href: z.string() }),
  footerLinks: z.array(z.object({ id: z.string(), label: z.string(), href: z.string() })),
  footerTagline: z.string(),
  footerDisclaimer: z.string(),
  contactEmail: z.string(),
  copyright: z.string(),
  editor: z.object({
    supportedLocales: z.array(localeSchema),
    supportedPageKeys: z.array(pageKeySchema),
    supportedSectionTypes: z.array(z.string()),
  }),
})
export type SiteSettings = z.infer<typeof siteSettingsSchema>

export const contentBundleSchema = z.object({
  site: siteSettingsSchema,
  locales: z.object({
    fi: z.object({ home: pageContentSchema.optional() }),
  }),
})
export type ContentBundle = z.infer<typeof contentBundleSchema>
