import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { CheckIcon } from '@/components/icons'
import { getStripe } from '@/lib/stripe'
import { eur, quote, type ReportKind } from '@/lib/pricing'
import { postOrder, postCheckoutGenerate } from '@/lib/orders'
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

// What actually happened server-side. The page copy must follow this, never
// promise more: telling a customer "raportti toimitetaan sähköpostiisi" when
// both generation AND order intake failed is the worst outcome, because nobody
// — not them, not us — finds out until they chase it.
type Outcome =
  | 'generating' // pipeline started; reportLink is live
  | 'queued' // no auto-generation, but the order reached the operator
  | 'failed' // nothing was recorded anywhere — tell the truth, give a contact

type OrderResult = {
  demo: boolean
  companyName: string
  kindLabel: string
  outcome: Outcome
  // Set only when outcome === 'generating'.
  reportLink: string | null
  // Buyer opted in to reviewing forecasts before the report: the run stops at
  // the forecast step and does NOT auto-deliver — they must open the link.
  awaitingForecast: boolean
}

// kind==='existing' means we already hold the company's financials, so
// generation can start automatically instead of an operator fulfilling by
// hand. 'import'/'creditsafe' still need a human step (upload / Creditsafe
// fetch isn't wired to auto-generation yet) — those stay on postOrder.
async function startGeneration(
  companyName: string, businessId: string, email: string, userInput: string, sessionId: string,
  forecast: boolean,
): Promise<string | null> {
  if (!businessId) return null
  const result = await postCheckoutGenerate({
    businessId, companyName, email, userInput, stripeSessionId: sessionId, forecast,
  })
  return result ? `/testi?key=${encodeURIComponent(result.key)}&rid=${encodeURIComponent(result.runId)}` : null
}

// Shared by the paid and demo branches: try auto-generation first, fall back to
// operator intake, and report which (if either) actually took.
//
// No in-memory reload guard around startGeneration — the backend is idempotent
// on sessionId and returns the existing run, so a reload re-derives the same
// link instead of losing it. postOrder has no such idempotency, so that one
// still needs the guard.
async function fulfil(
  kind: ReportKind, companyName: string, businessId: string, email: string,
  userInput: string, sessionId: string, orderNote: string, forecast: boolean,
): Promise<{ outcome: Outcome; reportLink: string | null }> {
  if (!email) return { outcome: 'failed', reportLink: null }

  if (kind === 'existing') {
    const reportLink = await startGeneration(companyName, businessId, email, userInput, sessionId, forecast)
    if (reportLink) return { outcome: 'generating', reportLink }
  }
  if (postedSessions.has(sessionId)) return { outcome: 'queued', reportLink: null }
  const queued = await postOrder({ company: companyName, email, user_input: orderNote })
  if (queued) postedSessions.add(sessionId)
  return { outcome: queued ? 'queued' : 'failed', reportLink: null }
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
    const businessId = session.metadata?.businessId || ''
    const userInput = session.metadata?.userInput || ''
    const forecast = session.metadata?.forecast === 'true'
    const email =
      session.customer_details?.email ||
      session.customer_email ||
      session.metadata?.customerEmail ||
      ''

    const { outcome, reportLink } = await fulfil(
      kind, companyName, businessId, email, userInput, sessionId,
      `MAKSETTU (Stripe ${sessionId}), tuote: ${kind}, hinta: ${eur(session.amount_total ?? 0)}`,
      forecast,
    )
    return {
      demo: false, companyName, kindLabel: kindLabels[kind], outcome, reportLink,
      awaitingForecast: forecast && outcome === 'generating',
    }
  }

  // --- Demo flow: no Stripe key or explicit ?demo=1 --------------------------
  const kind = asKind(param(sp, 'kind'))
  const companyName = param(sp, 'company')
  const businessId = param(sp, 'businessId')
  const userInput = param(sp, 'userInput')
  const email = param(sp, 'email')
  const forecast = param(sp, 'forecast') === '1'
  const q = quote(kind, param(sp, 'share') === '1')
  // `n` (minted once per /api/checkout call, see route.ts) makes this key
  // unique per checkout attempt, not just per company+email — without it, a
  // person retrying the same company forever resolves to their first
  // attempt's run (see the 2026-07-10 Turun Tislaamo incident).
  const demoKey = `demo:${kind}:${companyName}:${email}:${param(sp, 'n')}`

  if (!companyName) return { demo: true, companyName, kindLabel: kindLabels[kind], outcome: 'failed', reportLink: null, awaitingForecast: false }
  const { outcome, reportLink } = await fulfil(
    kind, companyName, businessId, email, userInput, demoKey,
    `KOEMAKSU (ei veloitusta), tuote: ${kind}, hinta: ${eur(q.total)}`,
    forecast,
  )
  return {
    demo: true, companyName, kindLabel: kindLabels[kind], outcome, reportLink,
    awaitingForecast: forecast && outcome === 'generating',
  }
}

export default async function KassaValmisPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const sp = await searchParams

  let result: OrderResult = {
    demo: false, companyName: '', kindLabel: '', outcome: 'failed', reportLink: null,
    awaitingForecast: false,
  }
  let resolved = false
  try {
    result = await resolveAndPostOrder(sp)
    resolved = true
  } catch (err) {
    // Missing/invalid session must never crash the thank-you page — but it also
    // must not be dressed up as success. `outcome` stays 'failed'.
    console.error('kassa/valmis: order resolution failed', err)
  }
  const failed = result.outcome === 'failed'

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
            <span
              className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${
                failed ? 'bg-gold/20 text-gold' : 'bg-green/20 text-green-light'
              }`}
            >
              {failed ? <span className="text-2xl leading-none">!</span> : <CheckIcon className="h-7 w-7" />}
            </span>
            <p
              className={`mt-6 text-[13px] font-semibold uppercase tracking-[0.14em] ${
                failed ? 'text-gold' : 'text-green-light'
              }`}
            >
              {failed ? 'Tilausta ei saatu kirjattua' : 'Tilaus vastaanotettu'}
            </p>
            <h1 className="mt-3 text-balance text-4xl font-light tracking-[-0.02em] lg:text-5xl">
              {failed
                ? 'Jokin meni pieleen'
                : resolved && !result.demo
                  ? 'Kiitos, maksu onnistui'
                  : 'Kiitos tilauksestasi'}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-[17px] font-light leading-relaxed text-white/75">
              {result.companyName ? `${result.kindLabel} — ${result.companyName}. ` : ''}
              {result.awaitingForecast
                ? 'Valitsit ennusteiden tarkistuksen ennen raporttia. Avaa alla oleva linkki, tarkista tai muokkaa liikevaihto- ja EBIT-ennusteet, niin raportti luodaan sen jälkeen. Raportti EI käynnisty ennen kuin vahvistat ennusteet linkin takana.'
                : result.outcome === 'generating'
                ? 'Raportin generointi on käynnissä — kestää tyypillisesti 10–20 minuuttia. Lähetämme valmiin raportin sähköpostiisi, ja voit seurata sitä myös tästä sivusta.'
                : result.outcome === 'queued'
                  ? 'Raportti toimitetaan sähköpostiisi 30–60 minuutissa. Tiliä ei tarvita.'
                  : 'Tilaustasi ei valitettavasti saatu kirjattua järjestelmään, eikä raportin generointi käynnistynyt. Ole yhteydessä alla olevaan osoitteeseen, niin hoidamme sen käsin — älä jää odottamaan sähköpostia.'}
            </p>
            {result.reportLink && (
              <a
                href={result.reportLink}
                className="mx-auto mt-5 inline-block rounded-full bg-lime px-5 py-2.5 text-sm font-medium text-forest transition-colors hover:brightness-95"
              >
                {result.awaitingForecast ? 'Tarkista ennusteet ja luo raportti →' : 'Seuraa raporttia tästä →'}
              </a>
            )}
            {failed && (
              <a
                href={`mailto:${contactEmail}`}
                className="mx-auto mt-5 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-forest transition-colors hover:brightness-95"
              >
                {contactEmail}
              </a>
            )}
            {result.demo && !failed && (
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
                {failed ? 'Mitä nyt tapahtuu?' : 'Mitä seuraavaksi?'}
              </h2>
              <ul className="mt-5 space-y-3.5">
                {(failed
                  ? [
                      'Tilaustasi ei kirjattu järjestelmään — mitään ei ole jonossa, eikä raporttia ole tulossa automaattisesti.',
                      'Lähetä meille sähköpostia alla olevaan osoitteeseen ja mainitse yrityksen nimi, niin käynnistämme raportin käsin.',
                      'Jos maksoit kortilla, veloitusta ei ole tehty tai se hyvitetään.',
                    ]
                  : result.awaitingForecast
                    ? [
                        'Avaa yllä oleva linkki: näet yrityksen liikevaihto- ja EBIT-ennusteet ja voit muokata niitä omilla näkemyksilläsi — tai jatkaa suoraan meidän ennusteillamme.',
                        'Kun vahvistat ennusteet, raportin generointi käynnistyy ja kestää tyypillisesti 10–20 minuuttia. Valmis raportti toimitetaan sähköpostiisi.',
                        'Ennen vahvistusta raporttia ei luoda — muista siis avata linkki. Sama linkki näyttää myös valmiin raportin.',
                      ]
                    : [
                      'Analyysimme kokoaa yrityksen tilinpäätöstiedot ja laatii arvonmääritysraportin usealla menetelmällä.',
                      result.outcome === 'generating'
                        ? 'Valmis PDF-raportti toimitetaan sähköpostiisi 10–20 minuutin kuluttua — voit myös seurata edistymistä yllä olevasta linkistä.'
                        : 'Valmis PDF-raportti toimitetaan sähköpostiisi 30–60 minuutissa.',
                      'Jos tekoäly jää epävarmaksi jostain luvusta, se kysyy tarkentavia kysymyksiä samassa näkymässä — vastaamalla saat halutessasi tarkennetun version.',
                    ]
                ).map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-charcoal-mid">
                    <CheckIcon className={`mt-1 h-4 w-4 shrink-0 ${failed ? 'text-gold' : 'text-green'}`} />
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
              {result.reportLink && (
                <p className="mt-1.5 text-[13px] text-steel">
                  Jos raportin generointi ei etene tai jokin näyttää menneen pieleen, ota
                  yhteyttä:{' '}
                  <a href="mailto:excl@valuatum.com" className="font-medium text-green-deep hover:text-green">
                    excl@valuatum.com
                  </a>
                </p>
              )}
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
