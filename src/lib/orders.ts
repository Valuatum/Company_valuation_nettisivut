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
