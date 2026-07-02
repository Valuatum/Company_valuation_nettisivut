import { NextResponse } from 'next/server'
import { getStripe, siteUrl } from '@/lib/stripe'
import { quote, eur, type ReportKind } from '@/lib/pricing'

interface CheckoutBody {
  kind: ReportKind
  companyId?: string
  companyName?: string
  shareData?: boolean
  customerEmail?: string
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
  const customerEmail = body.customerEmail?.slice(0, 200) || ''
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
    const params = new URLSearchParams({ demo: '1', kind })
    if (companyName) params.set('company', companyName)
    if (customerEmail) params.set('email', customerEmail)
    if (shareData) params.set('share', '1')
    const demoTarget =
      kind === 'import'
        ? `/tilinpaatokset/lataa?${params}`
        : `/kassa/valmis?${params}`
    return NextResponse.json({ url: `${siteUrl()}${demoTarget}` })
  }

  // --- Real Stripe Checkout Session ------------------------------------------
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: q.total,
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
        customerEmail,
        shareData: String(shareData),
      },
      success_url: `${siteUrl()}${successPath}`,
      cancel_url: `${siteUrl()}/kassa/peruutettu`,
      automatic_tax: { enabled: false },
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
