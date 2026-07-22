'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type ClarificationRequest,
  type CompanyCandidate,
  type ExpertMe,
  type ForecastEdit,
  type ForecastPreview,
  Round2CapReachedError,
  forecastPreview,
  generate,
  generateForecast,
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

// Prefill data for the "Muuta ennusteita" table, pulled from the run's stage-0
// FAKTAT (forecast block, tEUR). `actual*` is the last realized year, shown
// read-only as a comparison column.
type ForecastData = {
  years: number[]
  rev: number[]
  ebit: number[]
  actualYear: number | null
  actualRev: number | null
  actualEbit: number | null
}

// Loosely-typed view of a stage-0 FAKTAT object (parsed JSON — fields validated
// at runtime below, so the shape is optional/unknown rather than `any`).
type Stage0 = {
  forecast?: { years?: unknown; net_sales?: unknown; ebit?: unknown }
  actuals?: {
    years?: unknown
    income_statement?: { net_sales?: unknown; ebit?: unknown }
  }
}

// Pull the forecast prefill out of a stage-0 FAKTAT object. Returns null when the
// forecast block is missing/empty so the editor simply isn't offered.
function extractForecastData(stage0: Stage0 | null | undefined): ForecastData | null {
  const fc = stage0?.forecast
  const years = fc?.years
  if (!Array.isArray(years) || years.length === 0) return null
  const rev = Array.isArray(fc?.net_sales) ? fc.net_sales : []
  const ebit = Array.isArray(fc?.ebit) ? fc.ebit : []
  if (!rev.some((v: unknown) => typeof v === 'number')) return null
  const aYears = stage0?.actuals?.years
  const income = stage0?.actuals?.income_statement
  const lastIdx = Array.isArray(aYears) ? aYears.length - 1 : -1
  const pick = (arr: unknown, i: number) =>
    Array.isArray(arr) && typeof arr[i] === 'number' ? arr[i] : null
  return {
    years,
    rev,
    ebit,
    actualYear: lastIdx >= 0 ? pick(aYears, lastIdx) : null,
    actualRev: lastIdx >= 0 ? pick(income?.net_sales, lastIdx) : null,
    actualEbit: lastIdx >= 0 ? pick(income?.ebit, lastIdx) : null,
  }
}

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
  // Opt-in (default off): stop after data fetch so the user can review/edit the
  // revenue+EBIT forecasts before the report is written (round-1 forecast flow).
  const [wantForecast, setWantForecast] = useState(false)
  // Forecast edits the user made on the round-1 awaiting_forecast screen (millions).
  const [round1Edits, setRound1Edits] = useState<ForecastEdit[]>([])
  // True while the generate-forecast request holds through the ValuBuild import
  // (~100 s); drives the "importing forecasts" progress label.
  const [importingForecast, setImportingForecast] = useState(false)

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
    scenarioProbabilities?: { pessimistic: number; base: number; optimistic: number }
    forecastEdits: ForecastEdit[]
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
      if (r.status === 'awaiting_forecast') {
        // Parked mid round-1 forecast review — show the editor, not a report.
        setBusy(false)
      } else if (r.status === 'running' || r.status === 'importing_forecast') {
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
    setWantForecast(false)
    setRound1Edits([])
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
  // `running` and `importing_forecast` keep polling; `awaiting_forecast` stops
  // and drops into the round-1 forecast-review screen (not a report, not an
  // error); everything else is terminal → fetch the report.
  function poll(rid: string, k: string = key) {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const r = await getRun(k, rid)
        setRun(r)
        if (r.status === 'awaiting_forecast') {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
          setBusy(false)
        } else if (r.status !== 'running' && r.status !== 'importing_forecast') {
          void finishRun(r, k)
        }
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
        mode: wantForecast ? 'forecast' : 'generate',
      })
      setRunId(run_id)
      setMe(await validateKey(key)) // refresh remaining quota
      poll(run_id)
    } catch (e: any) {
      setBusy(false)
      setError(e?.message || String(e))
    }
  }

  // Continue a round-1 run parked in awaiting_forecast. With edits the request
  // holds through the ValuBuild import (~100 s) before the report starts.
  async function continueFromForecast(edits: ForecastEdit[]) {
    if (!runId) return
    setBusy(true)
    setError(null)
    setImportingForecast(edits.length > 0)
    try {
      await generateForecast(key, runId, edits)
      poll(runId)
    } catch (e: any) {
      // Import failed → backend reset the run to awaiting_forecast; keep the
      // editor on screen so the user can retry or continue unchanged.
      setBusy(false)
      setError(e?.message || String(e))
    } finally {
      setImportingForecast(false)
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
    setRound1Edits([])
  }

  async function startRound2(
    answers: { id: string; question: string; answer: string }[],
    freeText: string,
    showOldNumbers: boolean,
    scenarioProbabilities: { pessimistic: number; base: number; optimistic: number } | undefined,
    forecastEdits: ForecastEdit[]
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
        scenario_probabilities: scenarioProbabilities,
        ...(forecastEdits.length ? { forecast_edits: forecastEdits } : {}),
      })
      setReportSrc(null)
      setRunId(run_id)
      poll(run_id)
    } catch (e: any) {
      setBusy(false)
      if (e instanceof Round2CapReachedError) {
        setCapReachedPayload({ answers, freeText, showOldNumbers, scenarioProbabilities, forecastEdits })
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
        scenario_probabilities: capReachedPayload.scenarioProbabilities,
        ...(capReachedPayload.forecastEdits.length
          ? { forecast_edits: capReachedPayload.forecastEdits }
          : {}),
      })
      window.location.href = checkout_url
    } catch (e: any) {
      setBuying(false)
      setError('Maksun käynnistys epäonnistui: ' + (e?.message || e))
    }
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  // Never hardcode the free-round count: it is ROUND2_MAX_PER_RUN on the backend
  // and has already changed once (2 -> 5). An unlimited key skips the cap entirely.
  const freeRounds = me?.free_rounds_per_report
  const roundsNote = me?.unlimited
    ? ''
    : freeRounds
      ? ` (${freeRounds} tarkennuskierrosta sisältyy)`
      : ''

  const results: any[] = run?.results || []
  const clarifications: ClarificationRequest[] =
    (!busy && Array.isArray(results.find((r) => r.order === 1)?.parsed_json?.clarification_requests)
      ? results.find((r) => r.order === 1).parsed_json.clarification_requests
      : []) || []
  const isRefinedVersion = Boolean(run?.parent_run_id)
  // Prefill for the forecast editor: the run's stage-0 FAKTAT forecast block.
  const forecastData: ForecastData | null = !busy
    ? extractForecastData(results.find((r) => r.order === 0)?.parsed_json)
    : null

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

          <fieldset className="mt-4 rounded-lg border border-neutral-200 p-3">
            <legend className="px-1 text-xs font-medium text-neutral-600">
              Omat ennusteet (valinnainen)
            </legend>
            <label className="flex cursor-pointer items-start gap-2 py-1">
              <input
                type="radio"
                name="forecast-mode"
                checked={!wantForecast}
                onChange={() => setWantForecast(false)}
                className="mt-0.5"
              />
              <span className="text-sm text-neutral-700">
                Käytä Valuatumin ennusteita — luo raportti suoraan{' '}
                <span className="text-neutral-400">(oletus)</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 py-1">
              <input
                type="radio"
                name="forecast-mode"
                checked={wantForecast}
                onChange={() => setWantForecast(true)}
                className="mt-0.5"
              />
              <span className="text-sm text-neutral-700">
                Haluan tarkistaa ennusteet — voin muokata liikevaihto- ja EBIT-ennusteita
                ennen raportin luontia
              </span>
            </label>
          </fieldset>

          <button
            onClick={startGeneration}
            disabled={!selected || (!me.unlimited && (me.remaining ?? 0) <= 0)}
            className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
          >
            {!me.unlimited && (me.remaining ?? 0) <= 0
              ? 'Kiintiö käytetty'
              : wantForecast
                ? 'Hae tiedot ja tarkista ennusteet'
                : 'Tuota arvonmääritys'}
          </button>
          <p className="mt-2 text-xs text-neutral-500">
            {wantForecast
              ? 'Haemme ensin yrityksen taloustiedot ja näytämme ennusteet — voit muokata niitä tai jatkaa suoraan. Sen jälkeen raportin generointi kestää tyypillisesti 10–20 minuuttia.'
              : 'Raportin generointi kestää tyypillisesti 10–20 minuuttia.'}{' '}
            Valmis raportti sisältää tekoälyn tarkentavia kysymyksiä — vastaamalla niihin saat
            halutessasi tarkennetun version{roundsNote}.
          </p>
        </div>
      )}

      {runId && busy && (
        <Progress
          results={results}
          awaitingImport={importingForecast || run?.status === 'importing_forecast'}
          forecastFetch={Boolean(run?.params?.forecast_mode) && !results.some((r: any) => r.order >= 1)}
        />
      )}

      {runId && !busy && run?.status === 'awaiting_forecast' && (
        <ForecastGate
          data={forecastData}
          edits={round1Edits}
          onEditsChange={setRound1Edits}
          onPreview={(text) => forecastPreview(key, runId, text)}
          onContinue={() => continueFromForecast(round1Edits)}
        />
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {reportSrc && (
        <div className="mt-6">
          {capReachedPayload ? (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <div className="text-sm font-semibold text-amber-900">
                {me?.free_rounds_per_report
                  ? `Maksuttomat tarkennuskierrokset (${me.free_rounds_per_report}) on käytetty`
                  : 'Maksuttomat tarkennuskierrokset on käytetty'}
              </div>
              <p className="mt-0.5 text-xs text-amber-700">
                {me?.paid_rounds_enabled
                  ? 'Vastauksesi on tallessa. Lisätarkennuskierros maksaa 5 € — se käynnistyy heti maksun jälkeen ja saat päivitetyn raportin samaan tapaan kuin edelliset.'
                  : 'Tämän raportin tarkennuskierrokset on käytetty. Raportti alla on viimeisin versio — voit yhä ladata sen PDF:nä. Jos tarvitset lisää tarkennuksia, ota yhteyttä: excel@valuatum.com'}
              </p>
              <div className="mt-3 flex items-center gap-3">
                {me?.paid_rounds_enabled && (
                  <button
                    onClick={buyExtraRound}
                    disabled={buying}
                    className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
                  >
                    {buying ? 'Siirrytään maksuun…' : 'Osta lisäkierros — 5 €'}
                  </button>
                )}
                <button
                  onClick={() => setCapReachedPayload(null)}
                  disabled={buying}
                  className="text-xs text-amber-700 hover:underline disabled:opacity-40"
                >
                  {me?.paid_rounds_enabled ? 'Muokkaa vastauksia' : 'Sulje'}
                </button>
              </div>
            </div>
          ) : (
            (clarifications.length > 0 || forecastData) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-neutral-900">Haluatko tarkentaa raporttia?</h3>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Lue raportti alla ensin — vastaa alle mihin haluat, tai kirjoita vapaasti mitä
                  tekoäly ei osannut kysyä.
                </p>
                <ClarifyPanel
                  busy={busy}
                  requests={clarifications}
                  forecastData={forecastData}
                  onForecastPreview={(text) => forecastPreview(key, runId!, text)}
                  onSubmit={startRound2}
                />
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
          <a href="mailto:excel@valuatum.com" className="text-neutral-600 hover:underline">
            excel@valuatum.com
          </a>
        </p>
      </div>
    </main>
  )
}

function Progress({
  results,
  awaitingImport = false,
  forecastFetch = false,
}: {
  results: any[]
  awaitingImport?: boolean
  // Forecast-mode data fetch before the review screen (~1 min) — not the
  // 10-20 min report generation, so the copy must differ.
  forecastFetch?: boolean
}) {
  const byOrder: Record<number, any> = {}
  for (const r of results) byOrder[r.order] = r
  const running = results.find((r) => r.status === 'running')
  const label = awaitingImport
    ? 'Tuodaan muokatut ennusteet Valuatumin malliin…'
    : forecastFetch
    ? 'Haetaan taloustiedot — pääset kohta tarkistamaan ennusteet…'
    : byOrder[0] && byOrder[0].status === 'running'
    ? 'Haetaan taloustietoja Valuatumista…'
    : running
    ? `Analysoidaan (vaihe ${running.order})…`
    : 'Käynnistetään…'
  return (
    <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
        <span className="text-sm text-emerald-800">{label}</span>
        <span className="text-xs text-emerald-600">
          {forecastFetch ? 'Kestää noin minuutin.' : 'Kestää tyypillisesti 10–20 minuuttia.'}
        </span>
      </div>
      {!forecastFetch && (
        <p className="mt-1.5 text-xs text-emerald-700">
          Valmis raportti sisältää tekoälyn tarkentavia kysymyksiä — vastaamalla niihin saat
          halutessasi tarkennetun version.
        </p>
      )}
    </div>
  )
}

// Round-1 checkpoint: the run has fetched data and is parked in awaiting_forecast.
// Show Valuatum's forecasts, let the user optionally edit them, then continue.
// Doing nothing and pressing the button is a first-class path — the report is
// simply generated on Valuatum's own numbers.
function ForecastGate({
  data,
  edits,
  onEditsChange,
  onPreview,
  onContinue,
}: {
  data: ForecastData | null
  edits: ForecastEdit[]
  onEditsChange: (edits: ForecastEdit[]) => void
  onPreview: (text: string) => Promise<ForecastPreview>
  onContinue: () => void
}) {
  const edited = edits.length > 0
  return (
    <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Tarkista ennusteet ennen raporttia</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Alla ovat Valuatumin ennusteet liikevaihdolle ja EBITille. Voit halutessasi muokata niitä
        omilla näkemyksilläsi — tai jättää ne ennalleen ja luoda raportin suoraan. Muokkaaminen on
        vapaaehtoista.
      </p>

      {data ? (
        <ForecastEditor
          data={data}
          busy={false}
          defaultOpen
          onPreview={onPreview}
          onEditsChange={onEditsChange}
        />
      ) : (
        <p className="mt-3 text-xs text-amber-700">
          Ennustedataa ei ollut saatavilla — raportti luodaan Valuatumin ennusteilla.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onContinue}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          {edited ? 'Luo raportti näillä ennusteilla' : 'Luo raportti Valuatumin ennusteilla'}
        </button>
        {edited && (
          <span className="text-xs text-neutral-500">
            Muokatut ennusteet viedään ensin Valuatumin malliin (n. 1–2 min) ennen raportin luontia.
          </span>
        )}
      </div>
    </div>
  )
}

function ClarifyPanel({
  requests,
  busy,
  forecastData,
  onForecastPreview,
  onSubmit,
}: {
  requests: ClarificationRequest[]
  busy: boolean
  forecastData: ForecastData | null
  onForecastPreview: (text: string) => Promise<ForecastPreview>
  onSubmit: (
    answers: { id: string; question: string; answer: string }[],
    freeText: string,
    showOldNumbers: boolean,
    scenarioProbabilities: { pessimistic: number; base: number; optimistic: number } | undefined,
    forecastEdits: ForecastEdit[]
  ) => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [freeText, setFreeText] = useState('')
  const [showOldNumbers, setShowOldNumbers] = useState(false)
  const [forecastEdits, setForecastEdits] = useState<ForecastEdit[]>([])
  const [probs, setProbs] = useState({ pessimistic: '', base: '', optimistic: '' })
  const probsFilled = [probs.pessimistic, probs.base, probs.optimistic].filter(
    (v) => v.trim() !== ''
  ).length
  const probsSum =
    (parseInt(probs.pessimistic) || 0) +
    (parseInt(probs.base) || 0) +
    (parseInt(probs.optimistic) || 0)
  const probsValid = probsFilled === 3 && probsSum === 100
  const probsError = probsFilled > 0 && !probsValid
  const answered =
    Object.values(answers).filter((v) => v.trim()).length +
    (freeText.trim() ? 1 : 0) +
    (probsValid ? 1 : 0)

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
      <div className="mt-2 rounded border border-amber-200 bg-white p-2">
        <div className="text-xs font-medium text-neutral-800">
          Skenaarioiden todennäköisyydet (valinnainen)
        </div>
        <div className="mt-0.5 text-[10px] text-neutral-500">
          Jätä tyhjäksi = AI valitsee itse. Täytä kaikki kolme, summan oltava 100 %.
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {(
            [
              ['pessimistic', 'Pessimistinen'],
              ['base', 'Konservatiivinen'],
              ['optimistic', 'Optimistinen'],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex flex-col text-[10px] text-neutral-600">
              {label}
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={probs[k]}
                onChange={(e) => setProbs((p) => ({ ...p, [k]: e.target.value }))}
                disabled={busy}
                placeholder="%"
                className="mt-0.5 w-16 rounded border border-neutral-300 px-2 py-1 text-xs"
              />
            </label>
          ))}
          <span className={`text-[10px] ${probsError ? 'text-red-600' : 'text-neutral-500'}`}>
            {probsFilled > 0 ? `Summa ${probsSum} %` : ''}
            {probsError ? ' — täytä kaikki kolme, summan oltava 100 %' : ''}
          </span>
        </div>
      </div>
      <textarea
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        disabled={busy}
        rows={2}
        placeholder="Muuta täydennettävää…"
        className="mt-2 w-full rounded border border-neutral-300 px-2 py-1 text-xs"
      />
      {forecastData && (
        <ForecastEditor
          data={forecastData}
          busy={busy}
          onPreview={onForecastPreview}
          onEditsChange={setForecastEdits}
        />
      )}
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
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          onClick={() =>
            onSubmit(
              requests
                .map((r) => ({ id: r.id, question: r.question, answer: (answers[r.id] || '').trim() }))
                .filter((a) => a.answer),
              freeText.trim(),
              showOldNumbers,
              probsValid
                ? {
                    pessimistic: parseInt(probs.pessimistic),
                    base: parseInt(probs.base),
                    optimistic: parseInt(probs.optimistic),
                  }
                : undefined,
              forecastEdits
            )
          }
          disabled={busy || (answered === 0 && forecastEdits.length === 0) || probsError}
          className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
        >
          Tarkenna raporttia (kierros 2)
        </button>
        {forecastEdits.length > 0 && (
          <span className="text-[11px] text-amber-700">
            Ennusteita muutettu — malli ja raportti lasketaan uudelleen (kesto tyypillisesti 10–20 min).
          </span>
        )}
      </div>
    </div>
  )
}

type Unit = 'abs' | 'pct'
const _fmt0 = new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 0 })
const _fmt1 = new Intl.NumberFormat('fi-FI', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

function _parseNum(s: string): number | null {
  const cleaned = s.replace(/[\s ]/g, '').replace(',', '.')
  if (cleaned === '') return null
  const v = parseFloat(cleaned)
  return Number.isFinite(v) ? v : null
}

// tEUR → millions (the import API unit), rounded to kill float noise.
function _toMillions(teur: number): number {
  return Math.round((teur / 1000) * 1e6) / 1e6
}

const _FC_ROWS = [
  { key: 'rev' as const, varname: 'ns' as const, name: 'Liikevaihto', pctLabel: 'kasvu-%' },
  { key: 'ebit' as const, varname: 'ebit' as const, name: 'EBIT', pctLabel: 'EBIT-%' },
]

// Collapsible revenue/EBIT forecast table. Edits are absolute tEUR in local
// state; per-row a tEUR ↔ % toggle converts in the browser (revenue = YoY
// growth %, EBIT = % of revenue). Changed cells are reported up as ForecastEdits
// (only cells that differ from the prefill, converted to millions).
function ForecastEditor({
  data,
  busy,
  onPreview,
  onEditsChange,
  defaultOpen = false,
}: {
  data: ForecastData
  busy: boolean
  onPreview: (text: string) => Promise<ForecastPreview>
  onEditsChange: (edits: ForecastEdit[]) => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [rev, setRev] = useState<number[]>(() => data.years.map((_, i) => data.rev[i]))
  const [ebit, setEbit] = useState<number[]>(() => data.years.map((_, i) => data.ebit[i]))
  const [mode, setMode] = useState<{ rev: Unit; ebit: Unit }>({ rev: 'abs', ebit: 'abs' })
  const [description, setDescription] = useState('')
  const [aiPreview, setAiPreview] = useState<ForecastPreview | null>(null)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [acceptedSummary, setAcceptedSummary] = useState<string | null>(null)

  const cur = { rev, ebit }
  const set = { rev: setRev, ebit: setEbit }

  const revPct = (arr: number[], i: number) => {
    const prev = i === 0 ? data.actualRev : arr[i - 1]
    if (!prev || !Number.isFinite(arr[i])) return NaN
    return (arr[i] / prev - 1) * 100
  }
  const ebitPct = (revArr: number[], ebitArr: number[], i: number) => {
    if (!revArr[i] || !Number.isFinite(ebitArr[i])) return NaN
    return (ebitArr[i] / revArr[i]) * 100
  }
  const changed = (key: 'rev' | 'ebit', i: number) =>
    Number.isFinite(cur[key][i]) && Math.abs(cur[key][i] - data[key][i]) > 0.5

  // Report edits (in millions) to the parent whenever a cell changes.
  //
  // ValuBuild's forecast import applies values year-by-year and STOPS at the first
  // year with no value, so sending only the changed cells (e.g. 2027-2029) drops
  // them when an earlier year (2025/2026) has none — verified end-to-end. So we
  // send a CONTIGUOUS block from the first forecast year through the last changed
  // year, filling untouched years with their current (baseline) value.
  // ponytail: workaround for ValuBuild dropping sparse years; drop back to
  // changed-only once ValuBuild sets values directly (PSD2-style, see handoff).
  useEffect(() => {
    let lastChanged = -1
    data.years.forEach((_, i) => {
      if (changed('rev', i) || changed('ebit', i)) lastChanged = i
    })
    const edits: ForecastEdit[] = []
    for (let i = 0; i <= lastChanged; i++) {
      _FC_ROWS.forEach((row) => {
        if (Number.isFinite(cur[row.key][i])) {
          edits.push({ varname: row.varname, year: data.years[i], value: _toMillions(cur[row.key][i]) })
        }
      })
    }
    onEditsChange(edits)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev, ebit, data])

  function commit(key: 'rev' | 'ebit', i: number, raw: string) {
    const v = _parseNum(raw)
    if (v === null) return // ignore unparseable; input reverts to state on re-render
    set[key]((arr) => {
      const next = arr.slice()
      if (mode[key] === 'abs') {
        next[i] = v
      } else if (key === 'rev') {
        const prev = i === 0 ? data.actualRev : next[i - 1]
        if (prev) next[i] = prev * (1 + v / 100)
      } else {
        next[i] = rev[i] * (v / 100)
      }
      return next
    })
  }

  function reset() {
    setRev(data.years.map((_, i) => data.rev[i]))
    setEbit(data.years.map((_, i) => data.ebit[i]))
    setAcceptedSummary(null)
  }

  async function createAiPreview() {
    const text = description.trim()
    if (!text) return
    setAiBusy(true)
    setAiError(null)
    setAiPreview(null)
    try {
      setAiPreview(await onPreview(text))
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : String(e))
    } finally {
      setAiBusy(false)
    }
  }

  function acceptAiPreview() {
    if (!aiPreview || aiPreview.edits.length === 0) return
    const byCell = new Map(
      aiPreview.rows.map((row) => [`${row.varname}:${row.year}`, row.value] as const),
    )
    setRev((current) =>
      data.years.map((year, i) => byCell.get(`ns:${year}`) ?? current[i]),
    )
    setEbit((current) =>
      data.years.map((year, i) => byCell.get(`ebit:${year}`) ?? current[i]),
    )
    setAcceptedSummary(aiPreview.summary || 'AI:n ehdottamat ennustemuutokset')
    setAiPreview(null)
  }

  const anyChanged = data.years.some((_, i) => changed('rev', i) || changed('ebit', i))

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border border-amber-200 bg-white px-3 py-2 text-left"
      >
        <span>
          <span className="text-[13px] font-semibold text-amber-900">
            Muuta ennusteita
            <span className="ml-2 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Uusi
            </span>
          </span>
          <span className="mt-0.5 block text-[11px] text-neutral-500">
            Voit halutessasi muuttaa raportin liikevaihto- ja EBIT-ennusteita — raportti ja
            arvonmääritys lasketaan uudelleen muutostesi pohjalta.
          </span>
        </span>
        <span className={`text-amber-700 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="rounded-b-md border border-t-0 border-amber-200 bg-white px-3 pb-3 pt-2">
          <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs font-semibold text-amber-900">
              Kuvaile, miten ennustetta pitäisi muuttaa
            </div>
            <p className="mt-0.5 text-[11px] text-amber-700">
              AI muodostaa kuvauksesta numeroehdotuksen. Näet ja hyväksyt luvut ennen
              raportin uudelleenlaskentaa.
            </p>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setAiError(null)
              }}
              disabled={busy || aiBusy}
              rows={3}
              maxLength={8000}
              placeholder="Esim. Liikevaihto kasvaa noin 20 % vuodessa uuden tuotelinjan ansiosta, ja EBIT-marginaali paranee 12 %:iin vuoteen 2028 mennessä."
              className="mt-2 w-full rounded border border-neutral-300 bg-white px-2.5 py-2 text-xs"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                ['Nopeampi kasvu + parempi marginaali', 'Liikevaihto kasvaa noin 20 % vuodessa uuden tuotelinjan ansiosta, ja EBIT-marginaali paranee 12 %:iin ennustejakson loppuun mennessä.'],
                ['Maltillisempi kasvu', 'Kasvu hidastuu noin 5 %:iin vuodessa markkinan kypsyessä. Kannattavuus säilyy nykytasolla.'],
              ].map(([label, text]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDescription(text)}
                  disabled={busy || aiBusy}
                  className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[10px] text-amber-800 hover:bg-amber-100 disabled:opacity-40"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void createAiPreview()}
                disabled={busy || aiBusy || !description.trim()}
                className="rounded border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-40"
              >
                {aiBusy ? 'AI muodostaa muutoksia…' : 'Muodosta muutokset (AI)'}
              </button>
              <span className="text-[10px] text-neutral-500">
                Kuvaus sekä nykyiset liikevaihto- ja EBIT-ennusteet käsitellään ulkoisessa
                AI-palvelussa (Google Gemini). Yrityksen nimeä, tunnusta tai sähköpostia ei lähetetä.
              </span>
            </div>
            {aiError && <p className="mt-2 text-[11px] text-red-600">{aiError}</p>}

            {aiPreview && (
              <div className="mt-3 overflow-hidden rounded-md border border-amber-300 bg-white">
                <div className="bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">
                  AI:n ehdotus — tarkista ennen käyttöönottoa
                </div>
                <div className="p-3">
                  {aiPreview.summary && (
                    <p className="border-l-2 border-amber-400 bg-neutral-50 px-2.5 py-2 text-xs text-neutral-700">
                      {aiPreview.summary}
                    </p>
                  )}
                  {aiPreview.rows.length > 0 ? (
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-neutral-200 text-left text-[10px] text-neutral-500">
                            <th className="py-1 pr-2">Muuttuja</th>
                            <th className="px-2 py-1 text-right">Vuosi</th>
                            <th className="px-2 py-1 text-right">Nykyinen</th>
                            <th className="py-1 pl-2 text-right">Ehdotus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aiPreview.rows.map((row) => (
                            <tr key={`${row.varname}-${row.year}`} className="border-b border-neutral-100 last:border-0">
                              <td className="py-1.5 pr-2 font-medium text-neutral-700">
                                {row.varname === 'ns' ? 'Liikevaihto' : 'EBIT'}
                              </td>
                              <td className="px-2 py-1.5 text-right">{row.year}</td>
                              <td className="px-2 py-1.5 text-right text-neutral-400">
                                {_fmt0.format(row.old)} tEUR
                              </td>
                              <td className="py-1.5 pl-2 text-right font-semibold text-neutral-900">
                                {_fmt0.format(row.value)} tEUR
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-neutral-600">
                      AI ei ehdottanut muutoksia nykyisiin ennustelukuihin.
                    </p>
                  )}
                  {aiPreview.notes.length > 0 && (
                    <ul className="mt-2 list-disc pl-4 text-[11px] text-amber-800">
                      {aiPreview.notes.map((note) => <li key={note}>{note}</li>)}
                    </ul>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={acceptAiPreview}
                      disabled={busy || aiPreview.edits.length === 0}
                      className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-40"
                    >
                      Käytä nämä muutokset
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiPreview(null)}
                      disabled={busy}
                      className="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                    >
                      Muokkaa kuvausta
                    </button>
                  </div>
                </div>
              </div>
            )}

            {acceptedSummary && (
              <div className="mt-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2">
                <div className="text-xs font-semibold text-emerald-800">
                  Ennustemuutokset otettu käyttöön
                </div>
                <p className="mt-0.5 text-[11px] text-emerald-700">{acceptedSummary}</p>
                <p className="mt-1 text-[10px] text-emerald-700">
                  Voit vielä hienosäätää hyväksyttyjä arvoja alla olevasta taulukosta.
                </p>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="text-[11px] text-neutral-500">
                  <th className="p-1 text-left" />
                  {data.actualYear != null && (
                    <th className="p-1 text-right text-neutral-400">
                      {data.actualYear}
                      <br />
                      (tot.)
                    </th>
                  )}
                  {data.years.map((y) => (
                    <th key={y} className="p-1 text-right">
                      {y}E
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {_FC_ROWS.map((row) => {
                  const isAbs = mode[row.key] === 'abs'
                  const actualVal = row.key === 'rev' ? data.actualRev : data.actualEbit
                  const actualPct =
                    row.key === 'ebit' && data.actualRev && actualVal != null
                      ? (actualVal / data.actualRev) * 100
                      : null
                  return (
                    <tr key={row.key}>
                      <td className="whitespace-nowrap p-1 text-left align-top">
                        <span className="text-xs font-semibold text-neutral-800">{row.name}</span>
                        <span className="mt-1 inline-flex overflow-hidden rounded border border-neutral-300">
                          {(['abs', 'pct'] as const).map((m) => (
                            <button
                              key={m}
                              type="button"
                              disabled={busy}
                              onClick={() => setMode((mm) => ({ ...mm, [row.key]: m }))}
                              className={`px-1.5 py-0.5 text-[10px] ${
                                mode[row.key] === m
                                  ? 'bg-neutral-800 text-white'
                                  : 'bg-white text-neutral-500'
                              }`}
                            >
                              {m === 'abs' ? 'tEUR' : row.pctLabel}
                            </button>
                          ))}
                        </span>
                      </td>
                      {data.actualYear != null && (
                        <td className="p-1 text-right align-top text-neutral-400">
                          {actualVal == null
                            ? '–'
                            : isAbs
                              ? _fmt0.format(actualVal)
                              : row.key === 'rev'
                                ? '–'
                                : actualPct != null
                                  ? `${_fmt1.format(actualPct)} %`
                                  : '–'}
                        </td>
                      )}
                      {data.years.map((y, i) => {
                        const pct =
                          row.key === 'rev' ? revPct(cur.rev, i) : ebitPct(cur.rev, cur.ebit, i)
                        const shown = isAbs
                          ? Number.isFinite(cur[row.key][i])
                            ? _fmt0.format(cur[row.key][i])
                            : ''
                          : Number.isFinite(pct)
                            ? _fmt1.format(pct)
                            : ''
                        const deriv = isAbs
                          ? Number.isFinite(pct)
                            ? `${_fmt1.format(pct)} %`
                            : ''
                          : Number.isFinite(cur[row.key][i])
                            ? `${_fmt0.format(cur[row.key][i])} tEUR`
                            : ''
                        const isChanged = changed(row.key, i)
                        return (
                          <td key={y} className="p-1 text-right align-top">
                            <input
                              defaultValue={shown}
                              key={`${row.key}-${i}-${mode[row.key]}-${shown}`}
                              disabled={busy}
                              onBlur={(e) => commit(row.key, i, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                              }}
                              className={`w-[4.6rem] rounded border px-1.5 py-1 text-right text-xs ${
                                isChanged
                                  ? 'border-amber-600 bg-amber-100 font-semibold'
                                  : 'border-neutral-300'
                              }`}
                            />
                            {deriv && (
                              <span className="mt-0.5 block text-[10px] text-neutral-400">{deriv}</span>
                            )}
                            {isChanged && (
                              <span className="mt-0.5 block text-[10px] text-amber-700">
                                alkup.{' '}
                                {isAbs
                                  ? _fmt0.format(data[row.key][i])
                                  : `${_fmt1.format(
                                      row.key === 'rev'
                                        ? revPct(data.rev, i)
                                        : ebitPct(data.rev, data.ebit, i)
                                    )} %`}
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">
              Luvut tuhansina euroina (tEUR). Prosenttinäkymässä liikevaihto = kasvu-%
              edellisvuodesta, EBIT = osuus liikevaihdosta.
            </span>
            {anyChanged && (
              <button
                type="button"
                onClick={reset}
                disabled={busy}
                className="text-[11px] text-amber-700 underline"
              >
                Palauta alkuperäiset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
