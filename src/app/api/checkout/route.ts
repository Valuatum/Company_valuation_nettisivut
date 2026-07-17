import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getStripe, siteUrl } from '@/lib/stripe'
import { quote, eur, type ReportKind } from '@/lib/pricing'

interface CheckoutBody {
  kind: ReportKind
  companyId?: string
  companyName?: string
  businessId?: string
  shareData?: boolean
  customerEmail?: string
  userInput?: string
}

export async function POST(req: Request) {
  let body: CheckoutBody
  try {
    body = (await req.json()) as CheckoutBody
  } catch {
    return NextResponse.json({ error: 'Virheellinen pyyntö' }, { status: 400 })
  }

  const kind: ReportKind =
    body.kind === 'import'
      ? 'import'
      : body.kind === 'creditsafe'
        ? 'creditsafe'
        : 'existing'
  // Sharing only meaningful for imported statements.
  const shareData = kind === 'import' && Boolean(body.shareData)
  const companyName = body.companyName?.slice(0, 200) || 'Valittu yritys'
  const businessId = body.businessId?.slice(0, 30) || ''
  const customerEmail = body.customerEmail?.slice(0, 200) || ''
  const userInput = body.userInput?.slice(0, 4000) || ''
  const q = quote(kind, shareData)

  // Where the user lands after a successful payment.
  // - import   -> the statement-upload step (gated behind payment)
  // - others   -> confirmation page that posts the order to the backend
  const successPath =
    kind === 'import'
      ? `/tilinpaatokset/lataa?session_id={CHECKOUT_SESSION_ID}`
      : `/kassa/valmis?session_id={CHECKOUT_SESSION_ID}&kind=${kind}`

  const stripe = getStripe()

  // --- Demo mode: no Stripe key configured -----------------------------------
  if (!stripe) {
    // A real Stripe session id is unique per checkout, which is what makes
    // /kassa/valmis's "idempotent on session id, safe to reload" behavior
    // correct. Without a nonce here, the demo-mode session id (built from
    // company+email in kassa/valmis) would be the same on every retry by the
    // same person for the same company — so a failed attempt (e.g. a spend
    // cap trip) would be re-shown forever instead of actually retrying.
    const params = new URLSearchParams({ demo: '1', kind, n: randomUUID() })
    if (companyName) params.set('company', companyName)
    if (businessId) params.set('businessId', businessId)
    if (customerEmail) params.set('email', customerEmail)
    if (userInput) params.set('userInput', userInput)
    if (shareData) params.set('share', '1')
    const demoTarget =
      kind === 'import'
        ? `/tilinpaatokset/lataa?${params}`
        : `/kassa/valmis?${params}`
    return NextResponse.json({ url: `${siteUrl()}${demoTarget}` })
  }

  // --- Real Stripe Checkout Session ------------------------------------------
  // Stripe Tax is gated behind STRIPE_TAX_ENABLED: with automatic_tax on but Tax
  // NOT set up in the dashboard, Stripe hard-errors EVERY checkout. So VAT stays
  // off until the dashboard setup (origin address + Finland registration) is
  // done, then flip STRIPE_TAX_ENABLED=1 — no code deploy needed. The advertised
  // prices are "+ alv" (VAT-exclusive), so when on, Tax adds Finnish VAT on top.
  const taxEnabled = process.env.STRIPE_TAX_ENABLED === '1'
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      ...(taxEnabled
        ? { billing_address_collection: 'required' as const, automatic_tax: { enabled: true } }
        : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: q.total,
            // Pre-tax amount; Stripe Tax adds VAT on top when enabled.
            ...(taxEnabled ? { tax_behavior: 'exclusive' as const } : {}),
            product_data: {
              name:
                kind === 'import'
                  ? `Tilinpäätösten tuonti + arvonmääritysraportti — ${companyName}`
                  : kind === 'creditsafe'
                    ? `Tietojen haku + arvonmääritysraportti — ${companyName}`
                    : `Arvonmääritysraportti — ${companyName}`,
              description: shareData
                ? `Sisältää ${eur(q.discount)} alennuksen tietojen jakamisesta`
                : undefined,
            },
          },
        },
      ],
      metadata: {
        kind,
        companyId: body.companyId ?? '',
        companyName,
        businessId,
        customerEmail,
        shareData: String(shareData),
        // Stripe metadata values cap at 500 chars — the model/DB allow up to
        // 4000, but that's for the immediate checkout-generate call below,
        // not for round-tripping through Stripe.
        userInput: userInput.slice(0, 500),
      },
      success_url: `${siteUrl()}${successPath}`,
      cancel_url: `${siteUrl()}/kassa/peruutettu`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('stripe checkout failed', err)
    return NextResponse.json(
      { error: 'Maksun käynnistys epäonnistui. Yritä uudelleen.' },
      { status: 500 },
    )
  }
}
