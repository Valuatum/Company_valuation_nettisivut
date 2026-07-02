// Company data access layer.
//
// In production this proxies the Valuatum backend (set VALUATUM_DATA_API_URL).
// Until that is wired up, a small bundled sample of Finnish companies is used so
// the search, results and buy flows are fully demonstrable end-to-end.

export interface Company {
  id: string // internal slug used in URLs
  name: string
  businessId: string // Finnish Y-tunnus
  city: string
  industry: string
  /**
   * Whether we already hold the financial statements for this company.
   * - true  -> "existing data" report, instant generation
   * - false -> user chooses upload ('import') or fetch ('creditsafe')
   */
  hasFinancials: boolean
  latestRevenueEur?: number
  employees?: number
}

// --- Bundled sample dataset (Finnish private companies) ------------------------
const SAMPLE: Company[] = [
  {
    id: 'rovio-entertainment',
    name: 'Rovio Entertainment Oyj',
    businessId: '1863026-2',
    city: 'Espoo',
    industry: 'Mobiilipelit',
    hasFinancials: true,
    latestRevenueEur: 318_000_000,
    employees: 530,
  },
  {
    id: 'wolt-enterprises',
    name: 'Wolt Enterprises Oy',
    businessId: '2646674-9',
    city: 'Helsinki',
    industry: 'Ruoka- ja vähittäiskaupan jakelu',
    hasFinancials: true,
    latestRevenueEur: 2_200_000_000,
    employees: 8000,
  },
  {
    id: 'supercell',
    name: 'Supercell Oy',
    businessId: '2336509-6',
    city: 'Helsinki',
    industry: 'Mobiilipelit',
    hasFinancials: true,
    latestRevenueEur: 1_540_000_000,
    employees: 490,
  },
  {
    id: 'relex-solutions',
    name: 'Relex Oy',
    businessId: '2096225-2',
    city: 'Helsinki',
    industry: 'Toimitusketjun ohjelmistot',
    hasFinancials: true,
    latestRevenueEur: 280_000_000,
    employees: 2000,
  },
  {
    id: 'oura-health',
    name: 'Oura Health Oy',
    businessId: '2545538-2',
    city: 'Oulu',
    industry: 'Terveysteknologia / puettavat laitteet',
    hasFinancials: true,
    latestRevenueEur: 360_000_000,
    employees: 850,
  },
  {
    id: 'iceye',
    name: 'ICEYE Oy',
    businessId: '2766397-6',
    city: 'Espoo',
    industry: 'Satelliittikuvantaminen (SAR)',
    hasFinancials: true,
    latestRevenueEur: 150_000_000,
    employees: 700,
  },
  {
    id: 'varjo-technologies',
    name: 'Varjo Technologies Oy',
    businessId: '2811597-7',
    city: 'Helsinki',
    industry: 'VR/XR-laitteet',
    hasFinancials: true,
    latestRevenueEur: 35_000_000,
    employees: 250,
  },
  {
    id: 'ponsse',
    name: 'Ponsse Oyj',
    businessId: '0533556-9',
    city: 'Vieremä',
    industry: 'Metsäkoneet',
    hasFinancials: true,
    latestRevenueEur: 760_000_000,
    employees: 2100,
  },
]

interface DataSource {
  search(query: string, limit?: number): Promise<Company[]>
  getById(id: string): Promise<Company | null>
}

class MockDataSource implements DataSource {
  async search(query: string, limit = 8): Promise<Company[]> {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const matches = SAMPLE.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.businessId.replace('-', '').includes(q.replace('-', '')) ||
        c.industry.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    )
    return matches.slice(0, limit)
  }

  async getById(id: string): Promise<Company | null> {
    return SAMPLE.find((c) => c.id === id) ?? null
  }
}

// Proxy hook: when VALUATUM_DATA_API_URL is set, all reads go to the backend.
class ApiDataSource implements DataSource {
  constructor(
    private baseUrl: string,
    private apiKey: string | undefined
  ) {}

  private headers(): HeadersInit {
    const h: Record<string, string> = { Accept: 'application/json' }
    if (this.apiKey) h.Authorization = `Bearer ${this.apiKey}`
    return h
  }

  async search(query: string, limit = 8): Promise<Company[]> {
    const url = new URL(`${this.baseUrl}/companies/search`)
    url.searchParams.set('q', query)
    url.searchParams.set('limit', String(limit))
    const res = await fetch(url, { headers: this.headers(), cache: 'no-store' })
    if (!res.ok) throw new Error(`Company search failed: ${res.status}`)
    return (await res.json()) as Company[]
  }

  async getById(id: string): Promise<Company | null> {
    const res = await fetch(`${this.baseUrl}/companies/${encodeURIComponent(id)}`, {
      headers: this.headers(),
      cache: 'no-store',
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Company fetch failed: ${res.status}`)
    return (await res.json()) as Company
  }
}

function source(): DataSource {
  const base = process.env.VALUATUM_DATA_API_URL
  if (base) return new ApiDataSource(base, process.env.VALUATUM_DATA_API_KEY)
  return new MockDataSource()
}

export function searchCompanies(query: string, limit?: number): Promise<Company[]> {
  return source().search(query, limit)
}

export function getCompany(id: string): Promise<Company | null> {
  return source().getById(id)
}

/**
 * A curated set of companies for browse/listing views. With the mock data
 * source this returns the bundled sample; with a real API it falls back to a
 * broad search so the view still populates.
 */
export async function featuredCompanies(limit = 8): Promise<Company[]> {
  if (!process.env.VALUATUM_DATA_API_URL) return SAMPLE.slice(0, limit)
  try {
    return await source().search('oy', limit)
  } catch {
    return []
  }
}
