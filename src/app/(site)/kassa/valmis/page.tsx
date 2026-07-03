import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { CheckIcon } from '@/components/icons'
import { getStripe } from '@/lib/stripe'
import { eur, quote, type ReportKind } from '@/lib/pricing'
import { postOrder } from '@/lib/orders'
import { getSiteSettings } from '@/content/server'

export const metadata: Metadata = {
  title: 'Kiitos tilauksesta | Valuatum Arvonmääritys',
  description: 'Maksu vastaanotettu — arvonmääritysraportti toimitetaan sähköpostiisi.',
  robots: { index: false },
}

// ponytail: in-memory guard against re-posting the order when the user reloads
// this page. Survives only this server instance — a Stripe webhook is the
// durable fix and is listed as follow-up for the integrator.
const postedSessions = new Set<string>()

type Search = Record<string, string | string[] | undefined>

function param(sp: Search, key: string): string {
  const v = sp[key]
  return typeof v === 'string' ? v : ''
}

function asKind(value: string): ReportKind {
  return value === 'import' || value === 'creditsafe' ? value : 'existing'
}

const kindLabels: Record<ReportKind, string> = {
  existing: 'Arvonmääritysraportti',
  import: 'Tilinpäätösten tuonti + arvonmääritysraportti',
  creditsafe: 'Tietojen haku + arvonmääritysraportti',
}

type OrderResult = {
  demo: boolean
  companyName: string
  kindLabel: string
}

async function resolveAndPostOrder(sp: Search): Promise<OrderResult> {
  const sessionId = param(sp, 'session_id')
  const stripe = getStripe()

  // --- Paid flow: verify the Stripe session ---------------------------------
  if (sessionId && !param(sp, 'demo') && stripe) {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') throw new Error('not paid')

    const kind = asKind(session.metadata?.kind ?? param(sp, 'kind'))
    const companyName = session.metadata?.companyName || 'Tuntematon yritys'
    const email =
      session.customer_details?.email ||
      session.customer_email ||
      session.metadata?.customerEmail ||
      ''

    if (email && !postedSessions.has(sessionId)) {
      postedSessions.add(sessionId)
      await postOrder({
        company: companyName,
        email,
        user_input: `MAKSETTU (Stripe ${sessionId}), tuote: ${kind}, hinta: ${eur(session.amount_total ?? 0)}`,
      })
    }
    return { demo: false, companyName, kindLabel: kindLabels[kind] }
  }

  // --- Demo flow: no Stripe key or explicit ?demo=1 --------------------------
  const kind = asKind(param(sp, 'kind'))
  const companyName = param(sp, 'company')
  const email = param(sp, 'email')
  const q = quote(kind, param(sp, 'share') === '1')
  const demoKey = `demo:${kind}:${companyName}:${email}`

  if (email && companyName && !postedSessions.has(demoKey)) {
    postedSessions.add(demoKey)
    await postOrder({
      company: companyName,
      email,
      user_input: `KOEMAKSU (ei veloitusta), tuote: ${kind}, hinta: ${eur(q.total)}`,
    })
  }
  return { demo: true, companyName, kindLabel: kindLabels[kind] }
}

export default async function KassaValmisPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const sp = await searchParams

  let result: OrderResult = { demo: false, companyName: '', kindLabel: '' }
  let resolved = false
  try {
    result = await resolveAndPostOrder(sp)
    resolved = true
  } catch (err) {
    // Missing/invalid session must never crash the thank-you page.
    console.error('kassa/valmis: order resolution failed', err)
  }

  let contactEmail = 'company-valuation@valuatum.com'
  try {
    contactEmail = (await getSiteSettings()).contactEmail
  } catch {}

  return (
    <>
      {/* Dark hero under the fixed 72px header */}
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="hero-pattern absolute inset-0" />
        <div className="hero-glow absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2" />
        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-36 text-center lg:pb-20 lg:pt-44">
          <Reveal>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green/20 text-green-light">
              <CheckIcon className="h-7 w-7" />
            </span>
            <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-green-light">
              Tilaus vastaanotettu
            </p>
            <h1 className="mt-3 text-balance text-4xl font-light tracking-[-0.02em] lg:text-5xl">
              {resolved && !result.demo ? 'Kiitos, maksu onnistui' : 'Kiitos tilauksestasi'}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-[17px] font-light leading-relaxed text-white/75">
              {result.companyName
                ? `${result.kindLabel} — ${result.companyName}. `
                : ''}
              Raportti toimitetaan sähköpostiisi 30–60 minuutissa. Tiliä ei tarvita.
            </p>
            {result.demo && (
              <p className="mx-auto mt-4 max-w-xl rounded-2xl border border-gold/40 bg-gold/10 px-5 py-3 text-[13.5px] leading-relaxed text-gold">
                Tämä oli testitilaus — maksua ei veloitettu. Tilaus kirjattiin
                järjestelmään merkinnällä KOEMAKSU.
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* Light body */}
      <section className="bg-off-white py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="rounded-3xl border border-mist bg-white p-6 lg:p-8">
              <h2 className="text-2xl font-light tracking-tight text-charcoal">
                Mitä seuraavaksi?
              </h2>
              <ul className="mt-5 space-y-3.5">
                {[
                  'Analyysimme kokoaa yrityksen tilinpäätöstiedot ja laatii arvonmääritysraportin usealla menetelmällä.',
                  'Valmis PDF-raportti toimitetaan sähköpostiisi 30–60 minuutissa.',
                  'Jos tietoja puuttuu tai jokin vaatii tarkennusta, otamme yhteyttä samaan sähköpostiosoitteeseen.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-charcoal-mid">
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-green" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-mist pt-5 text-[13.5px] leading-relaxed text-steel">
                Raportti on analyysi päätöksenteon tueksi — se ei ole tilintarkastus,
                fairness opinion eikä sijoitusneuvontaa.
              </p>
              <p className="mt-4 text-[14px] text-charcoal-mid">
                Kysyttävää?{' '}
                <a href={`mailto:${contactEmail}`} className="font-medium text-green-deep hover:text-green">
                  {contactEmail}
                </a>
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-block rounded-full bg-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-deep"
              >
                Takaisin etusivulle
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
