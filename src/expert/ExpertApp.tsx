'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type ClarificationRequest,
  type CompanyCandidate,
  type ExpertMe,
  Round2CapReachedError,
  generate,
  getRun,
  reportHtml,
  reportPdf,
  round2,
  round2Checkout,
  round2Redeem,
  searchCompany,
  validateKey,
} from './expertApi'

const KEY_STORAGE = 'valu_expert_key'
const TERMINAL = ['ok', 'validation_failed', 'error']

export function ExpertApp() {
  const [key, setKey] = useState('')
  const [me, setMe] = useState<ExpertMe | null>(null)

  const [query, setQuery] = useState('')
  const [candidates, setCandidates] = useState<CompanyCandidate[]>([])
  const [selected, setSelected] = useState<CompanyCandidate | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchErr, setSearchErr] = useState<string | null>(null)
  const [deliveryEmail, setDeliveryEmail] = useState('')
  const [userInput, setUserInput] = useState('')

  const [runId, setRunId] = useState<string | null>(null)
  const [run, setRun] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [reportSrc, setReportSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Free rounds (2) used up: hold the answers the user just typed so the
  // "buy extra round" button can send the same payload to checkout.
  const [capReachedPayload, setCapReachedPayload] = useState<{
    answers: { id: string; question: string; answer: string }[]
    freeText: string
    showOldNumbers: boolean
  } | null>(null)
  const [buying, setBuying] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Entry points, checked in order:
  // 1. Stripe just redirected back from a paid-extra-round checkout
  //    (?paid_round_token=&session_id=&rid=&key=) — redeem the payment and
  //    start that round.
  // 2. An emailed/on-screen link carries ?key=&rid= straight to a specific
  //    report (the paid checkout flow mints a single-use key per order).
  // 3. Otherwise restore a previously signed-in key from localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const urlKey = params.get('key')
    const urlRid = params.get('rid')
    const paidToken = params.get('paid_round_token')
    const sessionId = params.get('session_id')
    const showOld = params.get('show_old_numbers') === '1'
    if (urlKey && urlRid && paidToken && sessionId) {
      void resumePaidRound(urlKey, urlRid, paidToken, sessionId, showOld)
      return
    }
    if (urlKey && urlRid) {
      void resumeFromLink(urlKey, urlRid)
      return
    }
    const saved = localStorage.getItem(KEY_STORAGE)
    if (saved) void signIn(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function resumeFromLink(k: string, rid: string) {
    setError(null)
    const info = await validateKey(k)
    if (!info) {
      setError('Avain ei kelpaa tai on käytetty loppuun.')
      return
    }
    localStorage.setItem(KEY_STORAGE, k)
    setKey(k)
    setMe(info)
    try {
      const r = await getRun(k, rid)
      setRunId(rid)
      setRun(r)
      if (r.status === 'running') {
        setBusy(true)
        poll(rid, k)
      } else {
        setBusy(true)
        await finishRun(r, k)
      }
    } catch (e: any) {
      setError('Raporttia ei löytynyt: ' + (e?.message || e))
    }
  }

  async function resumePaidRound(k: string, rid: string, token: string, sessionId: string, showOldNumbers: boolean) {
    setError(null)
    const info = await validateKey(k)
    if (!info) {
      setError('Avain ei kelpaa tai on käytetty loppuun.')
      return
    }
    localStorage.setItem(KEY_STORAGE, k)
    setKey(k)
    setMe(info)
    setBusy(true)
    try {
      const { run_id } = await round2Redeem(k, rid, { token, stripe_session_id: sessionId, show_old_numbers: showOldNumbers })
      setRunId(run_id)
      poll(run_id, k)
    } catch (e: any) {
      setBusy(false)
      setError('Maksettua lisäkierrosta ei voitu käynnistää: ' + (e?.message || e))
      // Fall back to showing the original report so the page isn't just an error.
      await resumeFromLink(k, rid)
    }
  }

  async function signIn(k: string) {
    setError(null)
    const info = await validateKey(k)
    if (!info) {
      setError('Avain ei kelpaa tai on käytetty loppuun.')
      return
    }
    localStorage.setItem(KEY_STORAGE, k)
    setKey(k)
    setMe(info)
  }

  function signOut() {
    localStorage.removeItem(KEY_STORAGE)
    setKey('')
    setMe(null)
    resetRun()
  }

  function resetRun() {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = null
    setRunId(null)
    setRun(null)
    setReportSrc(null)
    setBusy(false)
    setError(null)
    setQuery('')
    setCandidates([])
    setSelected(null)
    setSearchErr(null)
    setDeliveryEmail('')
    setUserInput('')
  }

  async function doSearch() {
    const q = query.trim()
    if (q.length < 2) return
    setSearching(true)
    setSearchErr(null)
    setSelected(null)
    setCandidates([])
    try {
      const results = await searchCompany(key, q)
      setCandidates(results)
      if (results.length === 1) setSelected(results[0])
      if (results.length === 0) {
        setSearchErr('Yritystä ei löytynyt. Tarkista nimi tai y-tunnus.')
      }
    } catch (e: any) {
      setSearchErr(e?.message || String(e))
    } finally {
      setSearching(false)
    }
  }

  const finishRun = useCallback(
    // k defaults to the signed-in key; resumeFromLink passes it explicitly
    // since it can't wait for the setKey() state update to land first.
    async (r: any, k: string = key) => {
      setBusy(false)
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = null
      const errored = (r.results || []).find((x: any) => x.status === 'error')
      if (errored) {
        setError(
          'Raportin tuottaminen epäonnistui teknisen virheen vuoksi. ' +
          'Käyttämätön krediitti on palautettu — kokeile generointia hetken päästä uudelleen. ' +
          `(Tekninen syy: vaihe ${errored.order}: ${errored.error_message || 'tuntematon virhe'})`,
        )
        return
      }
      try {
        setReportSrc(padHtml(await reportHtml(k, r.id)))
      } catch (e: any) {
        setError('Raporttia ei voitu hakea: ' + (e?.message || e))
      }
    },
    [key]
  )

  async function downloadPdf(open: boolean) {
    if (!runId) return
    try {
      const url = URL.createObjectURL(await reportPdf(key, runId))
      if (open) {
        window.open(url, '_blank')
      } else {
        const a = document.createElement('a')
        a.href = url
        a.download = 'arvonmaaritys.pdf'
        a.click()
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (e: any) {
      setError('PDF:n haku epäonnistui: ' + (e?.message || e))
    }
  }

  // Poll a run until it settles. k defaults to the signed-in key; see finishRun.
  function poll(rid: string, k: string = key) {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const r = await getRun(k, rid)
        setRun(r)
        if (r.status !== 'running') void finishRun(r, k)
      } catch {
        /* transient */
      }
    }, 3000)
  }

  async function startGeneration() {
    if (!selected) return
    const company = selected
    resetRunKeepSelection()
    setBusy(true)
    try {
      const { run_id } = await generate(key, {
        fid: company.fid,
        company_name: company.company_name || query.trim(),
        company_code: company.company_code,
        industry_text: company.industry_text,
        industry_code: company.industry_code,
        industry_id: company.industry_id,
        industry_tree: company.industry_tree,
        delivery_email: deliveryEmail.trim() || undefined,
        user_input: userInput.trim() || undefined,
      })
      setRunId(run_id)
      setMe(await validateKey(key)) // refresh remaining quota
      poll(run_id)
    } catch (e: any) {
      setBusy(false)
      setError(e?.message || String(e))
    }
  }

  // Like resetRun, but keeps the already-picked company + free-text notes
  // (used right before starting a generation, not when leaving the run).
  function resetRunKeepSelection() {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = null
    setRunId(null)
    setRun(null)
    setReportSrc(null)
    setBusy(false)
    setError(null)
  }

  async function startRound2(
    answers: { id: string; question: string; answer: string }[],
    freeText: string,
    showOldNumbers: boolean
  ) {
    if (!runId) return
    setBusy(true)
    setError(null)
    setCapReachedPayload(null)
    try {
      const { run_id } = await round2(key, runId, {
        clarifications: answers,
        clarifications_free_text: freeText,
        show_old_numbers: showOldNumbers,
      })
      setReportSrc(null)
      setRunId(run_id)
      poll(run_id)
    } catch (e: any) {
      setBusy(false)
      if (e instanceof Round2CapReachedError) {
        setCapReachedPayload({ answers, freeText, showOldNumbers })
      } else {
        setError(e?.message || String(e))
      }
    }
  }

  async function buyExtraRound() {
    if (!runId || !capReachedPayload) return
    setBuying(true)
    setError(null)
    try {
      const { checkout_url } = await round2Checkout(key, runId, {
        clarifications: capReachedPayload.answers,
        clarifications_free_text: capReachedPayload.freeText,
        show_old_numbers: capReachedPayload.showOldNumbers,
      })
      window.location.href = checkout_url
    } catch (e: any) {
      setBuying(false)
      setError('Maksun käynnistys epäonnistui: ' + (e?.message || e))
    }
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const results: any[] = run?.results || []
  const clarifications: ClarificationRequest[] =
    (!busy && Array.isArray(results.find((r) => r.order === 1)?.parsed_json?.clarification_requests)
      ? results.find((r) => r.order === 1).parsed_json.clarification_requests
      : []) || []
  const isRefinedVersion = Boolean(run?.parent_run_id)

  // ── gate ──────────────────────────────────────────────────────────────
  if (!me) {
    return (
      <Shell>
        <div className="max-w-md mx-auto mt-20">
          <h1 className="text-2xl font-semibold text-neutral-900">Testi</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Syötä kutsuavaimesi. Krediiteilläsi voit tuottaa rajatun määrän
            arvonmäärityksiä; tarkennukset (kierros 2) ovat maksuttomia.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); void signIn(key) }}
            className="mt-6 flex gap-2"
          >
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="exp_…"
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
              Kirjaudu
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </Shell>
    )
  }

  // ── app ───────────────────────────────────────────────────────────────
  return (
    <Shell>
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Arvonmääritys — testi</h1>
          <p className="text-xs text-neutral-500">{me.label}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-neutral-900">
            {me.unlimited ? 'Rajaton käyttö' : `${me.remaining} / ${me.generations_limit} krediittiä`}
          </div>
          <div className="flex items-center justify-end gap-3">
            {runId && !busy && (
              // Always-reachable escape: a failed/finished run otherwise dead-ends
              // the page (the search form is hidden once runId is set).
              <button onClick={resetRun} className="text-xs font-medium text-amber-700 hover:text-amber-900">
                + Aloita uusi
              </button>
            )}
            <button onClick={signOut} className="text-xs text-neutral-400 hover:text-neutral-600">
              Kirjaudu ulos
            </button>
          </div>
        </div>
      </div>

      {!runId && (
        <div className="mt-6 max-w-xl">
          <label className="block text-sm font-medium text-neutral-700">Yritys (nimi tai y-tunnus)</label>
          <div className="mt-1 flex gap-2">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void doSearch() } }}
              placeholder="esim. Valuatum Oy tai 1612398-8"
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <button
              onClick={doSearch}
              disabled={searching || query.trim().length < 2}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
            >
              {searching ? 'Haetaan…' : 'Hae'}
            </button>
          </div>
          {searchErr && <p className="mt-1 text-xs text-red-600">{searchErr}</p>}

          {candidates.length > 1 && !selected && (
            <div className="mt-2 grid gap-1">
              {candidates.map((c) => (
                <button
                  key={`${c.fid}-${c.analyst_name || ''}`}
                  onClick={() => setSelected(c)}
                  className="rounded border border-neutral-200 px-2 py-1.5 text-left text-xs hover:bg-neutral-50"
                >
                  {c.company_name} — {c.company_code}
                  {c.industry_text ? ` · ${c.industry_text}` : ''}
                  {c.analyst_name ? ` (${c.analyst_name})` : ''}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <span>
                Valittu: {selected.company_name} ({selected.company_code})
                {selected.industry_text ? ` · ${selected.industry_text}` : ''}
              </span>
              <button
                onClick={() => { setSelected(null); setCandidates([]) }}
                className="font-medium text-emerald-700 hover:underline"
              >
                Vaihda
              </button>
            </div>
          )}

          <label className="mt-4 block text-sm font-medium text-neutral-700">
            Sähköposti raportille (valinnainen)
          </label>
          <input
            value={deliveryEmail}
            onChange={(e) => setDeliveryEmail(e.target.value)}
            type="email"
            placeholder="nimi@yritys.fi"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />

          <label className="mt-4 block text-sm font-medium text-neutral-700">
            Lisätiedot (valinnainen)
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={3}
            placeholder="Omat oletukset, tiedot joita ei löydy julkisista lähteistä…"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />

          <button
            onClick={startGeneration}
            disabled={!selected || (!me.unlimited && (me.remaining ?? 0) <= 0)}
            className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
          >
            {!me.unlimited && (me.remaining ?? 0) <= 0 ? 'Kiintiö käytetty' : 'Tuota arvonmääritys'}
          </button>
          <p className="mt-2 text-xs text-neutral-500">
            Raportin generointi kestää tyypillisesti 10–20 minuuttia. Valmis raportti sisältää
            tekoälyn tarkentavia kysymyksiä — vastaamalla niihin saat halutessasi tarkennetun
            version (2 tarkennuskierrosta sisältyy).
          </p>
        </div>
      )}

      {runId && busy && <Progress results={results} />}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {reportSrc && (
        <div className="mt-6">
          {capReachedPayload ? (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <div className="text-sm font-semibold text-amber-900">
                Kaksi maksutonta tarkennuskierrosta on käytetty
              </div>
              <p className="mt-0.5 text-xs text-amber-700">
                Vastauksesi on tallessa. Lisätarkennuskierros maksaa 5 € — se käynnistyy heti
                maksun jälkeen ja saat päivitetyn raportin samaan tapaan kuin edelliset.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={buyExtraRound}
                  disabled={buying}
                  className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
                >
                  {buying ? 'Siirrytään maksuun…' : 'Osta lisäkierros — 5 €'}
                </button>
                <button
                  onClick={() => setCapReachedPayload(null)}
                  disabled={buying}
                  className="text-xs text-amber-700 hover:underline disabled:opacity-40"
                >
                  Muokkaa vastauksia
                </button>
              </div>
            </div>
          ) : (
            clarifications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-neutral-900">Haluatko tarkentaa raporttia?</h3>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Lue raportti alla ensin — vastaa alle mihin haluat, tai kirjoita vapaasti mitä
                  tekoäly ei osannut kysyä.
                </p>
                <ClarifyPanel busy={busy} requests={clarifications} onSubmit={startRound2} />
              </div>
            )
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-neutral-900">
              {isRefinedVersion ? 'Tarkennettu versio' : 'Ensimmäinen versio'}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => downloadPdf(false)}
                className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700"
              >
                Lataa PDF
              </button>
              <button
                onClick={() => downloadPdf(true)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Avaa PDF uuteen välilehteen
              </button>
            </div>
          </div>
          <iframe
            title="Raportti"
            srcDoc={reportSrc}
            className="mt-3 h-[80vh] w-full rounded-lg border border-neutral-200 bg-white"
          />

          <button
            onClick={resetRun}
            className="mt-4 text-sm text-emerald-700 hover:underline"
          >
            ← Uusi arvonmääritys
          </button>
        </div>
      )}
    </Shell>
  )
}

// The backend report HTML is laid out for an A4 PDF; on screen its content
// hugs the frame edges. Inject a little side padding for the in-page view only
// (the downloaded PDF comes straight from the backend, unaffected).
function padHtml(html: string): string {
  const style = '<style>body{padding:24px 32px !important;box-sizing:border-box}</style>'
  return html.includes('</head>') ? html.replace('</head>', style + '</head>') : style + html
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {children}
        <p className="mt-10 border-t border-neutral-200 pt-4 text-xs text-neutral-400">
          Jos jokin menee pieleen, ota yhteyttä:{' '}
          <a href="mailto:excl@valuatum.com" className="text-neutral-600 hover:underline">
            excl@valuatum.com
          </a>
        </p>
      </div>
    </main>
  )
}

function Progress({ results }: { results: any[] }) {
  const byOrder: Record<number, any> = {}
  for (const r of results) byOrder[r.order] = r
  const running = results.find((r) => r.status === 'running')
  const label = byOrder[0] && byOrder[0].status === 'running'
    ? 'Haetaan taloustietoja Valuatumista…'
    : running
    ? `Analysoidaan (vaihe ${running.order})…`
    : 'Käynnistetään…'
  return (
    <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
        <span className="text-sm text-emerald-800">{label}</span>
        <span className="text-xs text-emerald-600">Kestää tyypillisesti 10–20 minuuttia.</span>
      </div>
      <p className="mt-1.5 text-xs text-emerald-700">
        Valmis raportti sisältää tekoälyn tarkentavia kysymyksiä — vastaamalla niihin saat
        halutessasi tarkennetun version (2 tarkennuskierrosta sisältyy).
      </p>
    </div>
  )
}

function ClarifyPanel({
  requests,
  busy,
  onSubmit,
}: {
  requests: ClarificationRequest[]
  busy: boolean
  onSubmit: (
    answers: { id: string; question: string; answer: string }[],
    freeText: string,
    showOldNumbers: boolean
  ) => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [freeText, setFreeText] = useState('')
  const [showOldNumbers, setShowOldNumbers] = useState(false)
  const answered =
    Object.values(answers).filter((v) => v.trim()).length + (freeText.trim() ? 1 : 0)

  return (
    <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <div className="text-sm font-semibold text-amber-900">Täydennä ja tarkenna</div>
      <p className="mt-0.5 text-xs text-amber-700">
        AI ei voinut varmentaa näitä. Vastaa mihin voit — tarkennettu raportti (kierros 2) ei
        kuluta kiintiötä.
      </p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {requests.map((r) => (
          <div key={r.id} className="rounded border border-amber-200 bg-white p-2">
            <div className="text-xs font-medium text-neutral-800">{r.question}</div>
            {r.valuation_impact && (
              <div className="mt-0.5 text-[10px] text-amber-600">Vaikutus: {r.valuation_impact}</div>
            )}
            <textarea
              value={answers[r.id] || ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [r.id]: e.target.value }))}
              disabled={busy}
              rows={2}
              placeholder="Vastauksesi (jätä tyhjäksi jos et tiedä)"
              className="mt-1 w-full rounded border border-neutral-300 px-2 py-1 text-xs"
            />
          </div>
        ))}
      </div>
      <textarea
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        disabled={busy}
        rows={2}
        placeholder="Muuta täydennettävää…"
        className="mt-2 w-full rounded border border-neutral-300 px-2 py-1 text-xs"
      />
      <label className="mt-2 flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showOldNumbers}
          onChange={(e) => setShowOldNumbers(e.target.checked)}
          disabled={busy}
          className="accent-amber-600"
        />
        Näytä vanhat luvut (vanha → uusi)
      </label>
      <button
        onClick={() =>
          onSubmit(
            requests
              .map((r) => ({ id: r.id, question: r.question, answer: (answers[r.id] || '').trim() }))
              .filter((a) => a.answer),
            freeText.trim(),
            showOldNumbers
          )
        }
        disabled={busy || answered === 0}
        className="mt-2 rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
      >
        Tarkenna raporttia (kierros 2)
      </button>
    </div>
  )
}
