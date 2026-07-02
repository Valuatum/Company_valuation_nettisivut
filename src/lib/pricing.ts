// Central pricing config. All amounts in EUR cents (all prices + alv).
// Override via env so finance/ops can tune prices without code changes.
// Launch pricing: 79 € base (matches the landing's advertised price) with
// data-availability surcharges; sharing imported statements waives the
// import surcharge back down to the base price.

export const PRICES = {
  existingReport: Number(process.env.PRICE_EXISTING_REPORT ?? 7900), // 79 € — data already on file
  importReport: Number(process.env.PRICE_IMPORT_REPORT ?? 9900), // 99 € — user imports statements, no data sharing
  shareDiscount: Number(process.env.PRICE_SHARE_DISCOUNT ?? 2000), // 20 € off (import + share = 79 €, same as on-file)
  creditsafeReport: Number(process.env.PRICE_CREDITSAFE_REPORT ?? 12900), // 129 € — we retrieve the statements
} as const

// "existing"  -> we already hold the financial statements
// "import"    -> user uploads five years of PDF statements
// "creditsafe"-> user has no statements; we fetch them from CreditSafe / provider
export type ReportKind = 'existing' | 'import' | 'creditsafe'

export function eur(cents: number): string {
  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

export interface PriceQuote {
  kind: ReportKind
  shareData: boolean
  base: number
  discount: number
  total: number
}

export function quote(kind: ReportKind, shareData: boolean): PriceQuote {
  const base =
    kind === 'creditsafe'
      ? PRICES.creditsafeReport
      : kind === 'import'
        ? PRICES.importReport
        : PRICES.existingReport
  // The data-sharing discount only applies to statements the user imports.
  const discount = kind === 'import' && shareData ? PRICES.shareDiscount : 0
  return {
    kind,
    shareData,
    base,
    discount,
    total: Math.max(0, base - discount),
  }
}
