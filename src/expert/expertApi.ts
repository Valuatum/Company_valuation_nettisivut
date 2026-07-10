// Expert self-serve calls to the valuation backend, authenticated with an
// invite-only `exp_` key (per-key generation quota enforced server-side).
const API =
  process.env.NEXT_PUBLIC_ORDERS_API ??
  'https://valu-pipeline-production-88f2.up.railway.app'

const auth = (key: string) => ({ Authorization: `Bearer ${key}` })
const jsonAuth = (key: string) => ({ ...auth(key), 'Content-Type': 'application/json' })

// FastAPI errors arrive as `{"detail":"…"}`; surface the human message, not raw JSON.
async function apiError(r: Response): Promise<Error> {
  const text = (await r.text()) || `HTTP ${r.status}`
  try {
    const detail = JSON.parse(text)?.detail
    if (typeof detail === 'string' && detail) return new Error(detail)
  } catch { /* not JSON */ }
  return new Error(text)
}

export type ExpertMe = {
  label: string
  generations_used: number
  generations_limit: number | null
  unlimited: boolean
  remaining: number | null
  // False when the backend has no Stripe key — /round2/checkout would 503, so
  // the UI must not offer to sell an extra round. Older backends omit these.
  paid_rounds_enabled?: boolean
  free_rounds_per_report?: number
}

export type SavedCompany = {
  fid: number
  company_name: string
  company_code: string | null
}

export type CompanyCandidate = {
  fid: number
  company_name: string | null
  company_code: string | null
  industry_text: string | null
  industry_code: string | null
  industry_id: unknown | null
  industry_tree: unknown | null
  analyst_name: string | null
}

export type ClarificationRequest = {
  id: string
  question: string
  why_it_matters?: string
  valuation_impact?: string
  current_assumption?: string
}

export async function validateKey(key: string): Promise<ExpertMe | null> {
  const r = await fetch(`${API}/api/expert/me`, { headers: auth(key) })
  return r.ok ? r.json() : null
}

export async function listCompanies(key: string): Promise<SavedCompany[]> {
  const r = await fetch(`${API}/api/companies`, { headers: auth(key) })
  return r.ok ? r.json() : []
}

// Resolve a company name or y-tunnus to Valuatum FID(s) — this is what lets
// an expert type ANY company instead of picking from the operator's
// pre-fetched list (the former FID blocker).
export async function searchCompany(key: string, q: string): Promise<CompanyCandidate[]> {
  const r = await fetch(`${API}/api/company-search?q=${encodeURIComponent(q)}`, {
    headers: auth(key),
  })
  if (!r.ok) throw await apiError(r)
  return r.json()
}

export async function generate(
  key: string,
  body: {
    fid: number
    company_name: string
    company_code?: string | null
    industry_text?: string | null
    industry_code?: string | null
    industry_id?: unknown | null
    industry_tree?: unknown | null
    delivery_email?: string | null
    user_input?: string
  }
): Promise<{ run_id: string }> {
  const r = await fetch(`${API}/api/expert/generate`, {
    method: 'POST',
    headers: jsonAuth(key),
    body: JSON.stringify(body),
  })
  if (!r.ok) throw await apiError(r)
  return r.json()
}

export async function getRun(key: string, rid: string): Promise<any> {
  const r = await fetch(`${API}/api/runs/${rid}`, { headers: auth(key) })
  if (!r.ok) throw await apiError(r)
  return r.json()
}

type Round2Body = {
  clarifications: { id: string; question: string; answer: string }[]
  clarifications_free_text: string
  show_old_numbers?: boolean
}

// Thrown by round2() when the free-round cap (429) is hit, so the UI can
// offer the paid extra-round flow instead of a bare error.
export class Round2CapReachedError extends Error {}

export async function round2(key: string, rid: string, body: Round2Body): Promise<{ run_id: string }> {
  const r = await fetch(`${API}/api/runs/${rid}/round2`, {
    method: 'POST',
    headers: jsonAuth(key),
    body: JSON.stringify(body),
  })
  if (r.status === 429) throw new Round2CapReachedError(await r.text())
  if (!r.ok) throw await apiError(r)
  return r.json()
}

// Paid extra round (round 3+): create a Stripe Checkout Session for one
// refinement past the free cap. Redirect the browser to checkout_url.
export async function round2Checkout(key: string, rid: string, body: Round2Body): Promise<{ checkout_url: string }> {
  const r = await fetch(`${API}/api/runs/${rid}/round2/checkout`, {
    method: 'POST',
    headers: jsonAuth(key),
    body: JSON.stringify(body),
  })
  if (!r.ok) throw await apiError(r)
  return r.json()
}

// Called after Stripe redirects back with ?paid_round_token=&session_id= —
// verifies payment server-side and actually starts the paid round.
export async function round2Redeem(
  key: string,
  rid: string,
  body: { token: string; stripe_session_id: string; show_old_numbers?: boolean }
): Promise<{ run_id: string }> {
  const r = await fetch(`${API}/api/runs/${rid}/round2/redeem`, {
    method: 'POST',
    headers: jsonAuth(key),
    body: JSON.stringify(body),
  })
  if (!r.ok) throw await apiError(r)
  return r.json()
}

export async function reportHtml(key: string, rid: string): Promise<string> {
  const r = await fetch(`${API}/api/runs/${rid}/report.html?force=1`, {
    headers: auth(key),
  })
  if (!r.ok) throw await apiError(r)
  return r.text()
}

export async function reportPdf(key: string, rid: string): Promise<Blob> {
  const r = await fetch(`${API}/api/runs/${rid}/report.pdf?force=1`, {
    headers: auth(key),
  })
  if (!r.ok) throw await apiError(r)
  return r.blob()
}
