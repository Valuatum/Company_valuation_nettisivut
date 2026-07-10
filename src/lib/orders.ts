// Order intake against the report-generation backend (Railway).
// Every purchase/upload flow funnels into the same POST /api/orders the
// hero form already uses — the operator sees all orders in one Tilaukset view.

const API = process.env.NEXT_PUBLIC_ORDERS_API ?? 'https://valu-pipeline-production-88f2.up.railway.app'

export type OrderPayload = {
  company: string
  email: string
  user_input?: string
}

export async function postOrder(payload: OrderPayload): Promise<boolean> {
  try {
    const r = await fetch(`${API}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: payload.company.slice(0, 200),
        email: payload.email.slice(0, 200),
        user_input: (payload.user_input ?? '').slice(0, 4000),
        website: '', // honeypot stays empty for legit orders
      }),
      cache: 'no-store',
    })
    return r.ok
  } catch {
    return false
  }
}

export type CheckoutGeneratePayload = {
  businessId: string
  companyName: string
  email: string
  userInput?: string
  stripeSessionId: string
}

export type CheckoutGenerateResult = { runId: string; key: string } | null

// Auto-generation path for the "we already have the financials" checkout
// flow: resolves the paid company to a Valuatum FID and starts the pipeline
// immediately, instead of waiting for an operator to fulfil the order by
// hand. Idempotent server-side on stripeSessionId.
//
// Logs the reason on failure. It used to swallow every error into a bare
// `null`, and the caller then told the customer "raportti toimitetaan
// sähköpostiisi" even when nothing had been queued at all.
export async function postCheckoutGenerate(
  payload: CheckoutGeneratePayload,
): Promise<CheckoutGenerateResult> {
  try {
    const r = await fetch(`${API}/api/public/checkout-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: payload.businessId.slice(0, 30),
        company_name: payload.companyName.slice(0, 300),
        email: payload.email.slice(0, 200),
        user_input: (payload.userInput ?? '').slice(0, 4000),
        stripe_session_id: payload.stripeSessionId.slice(0, 200),
        website: '',
      }),
      cache: 'no-store',
    })
    if (!r.ok) {
      console.error('checkout-generate failed', r.status, (await r.text()).slice(0, 300))
      return null
    }
    const data = (await r.json()) as { run_id?: string; key?: string }
    return data.run_id && data.key ? { runId: data.run_id, key: data.key } : null
  } catch (err) {
    console.error('checkout-generate threw', err)
    return null
  }
}
