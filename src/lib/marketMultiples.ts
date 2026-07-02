export type SectorKey = 'software' | 'industrial-tech' | 'business-services' | 'health-tech'

export interface SectorRange {
  key: SectorKey
  label: string
  description: string
  evEbitdaLow: number
  evEbitdaBase: number
  evEbitdaHigh: number
  revenueLow: number
  revenueHigh: number
}

export const SECTOR_RANGES: SectorRange[] = [
  {
    key: 'software',
    label: 'Ohjelmistot ja SaaS',
    description: 'Jatkuvalaskutteiset ohjelmistot, vertikaalinen SaaS ja digitaaliset työkalut.',
    evEbitdaLow: 8,
    evEbitdaBase: 11,
    evEbitdaHigh: 15,
    revenueLow: 2.2,
    revenueHigh: 5.5,
  },
  {
    key: 'industrial-tech',
    label: 'Teollisuusteknologia',
    description: 'Mittaus, automaatio, laiteohjelmistot ja tekninen laitevalmistus.',
    evEbitdaLow: 7,
    evEbitdaBase: 10,
    evEbitdaHigh: 13,
    revenueLow: 1.2,
    revenueHigh: 3.4,
  },
  {
    key: 'business-services',
    label: 'Yrityspalvelut',
    description: 'Taloushallinto, asiantuntijapalvelut ja jatkuvat B2B-palvelumallit.',
    evEbitdaLow: 5,
    evEbitdaBase: 7,
    evEbitdaHigh: 9,
    revenueLow: 0.7,
    revenueHigh: 1.8,
  },
  {
    key: 'health-tech',
    label: 'Terveysteknologia',
    description: 'Laite-, data- ja hyvinvointiteknologia, jolla on skaalautuva tuote.',
    evEbitdaLow: 6,
    evEbitdaBase: 9,
    evEbitdaHigh: 13,
    revenueLow: 1.5,
    revenueHigh: 4.2,
  },
]

export const DEFAULT_SECTOR = SECTOR_RANGES[0]

export const WISDOM_PEERS = [
  {
    company: 'Vaisala Oyj',
    ticker: 'VAIAS.HE',
    sector: 'Teollisuusteknologia',
    price: '55,20 €',
    sales2026: 618.5,
    ebitda2026: 121.5,
    ebitdaMargin: 19.6,
    updated: '29.1.2026',
  },
  {
    company: 'Talenom',
    ticker: 'TNOM.HE',
    sector: 'Yrityspalvelut',
    price: '1,162 €',
    sales2026: 124.6,
    ebitda2026: 27.0,
    ebitdaMargin: 21.6,
    updated: '5.5.2026',
  },
  {
    company: 'Admicom',
    ticker: 'ADMCM',
    sector: 'Ohjelmistot ja SaaS',
    price: '26,25 €',
    sales2026: 44.5,
    ebitda2026: 17.0,
    ebitdaMargin: 38.3,
    updated: '26.8.2025',
  },
]

export function getSector(key: SectorKey): SectorRange {
  return SECTOR_RANGES.find((s) => s.key === key) ?? DEFAULT_SECTOR
}
