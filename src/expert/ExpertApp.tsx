'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type ClarificationRequest,
  type CompanyCandidate,
  type ExpertMe,
  generate,
  getRun,
  reportHtml,
  reportPdf,
  round2,
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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Restore a saved key on load.
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(KEY_STORAGE) : ''
    if (saved) void signIn(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    async (r: any) => {
      setBusy(false)
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = null
      const errored = (r.results || []).find((x: any) => x.status === 'error')
      if (errored) {
        setError(`Vaihe ${errored.order} epäonnistui: ${errored.error_message || 'tuntematon virhe'}`)
        return
      }
      try {
        setReportSrc(padHtml(await reportHtml(key, r.id)))
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

  // Poll a run until it settles.
  function poll(rid: string) {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const r = await getRun(key, rid)
        setRun(r)
        if (r.status !== 'running') void finishRun(r)
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
    freeText: string
  ) {
    if (!runId) return
    setBusy(true)
    setReportSrc(null)
    setError(null)
    try {
      const { run_id } = await round2(key, runId, {
        clarifications: answers,
        clarifications_free_text: freeText,
      })
      setRunId(run_id)
      poll(run_id)
    } catch (e: any) {
      setBusy(false)
      setError(e?.message || String(e))
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
          <button onClick={signOut} className="text-xs text-neutral-400 hover:text-neutral-600">
            Kirjaudu ulos
          </button>
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

          {clarifications.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-neutral-900">Haluatko tarkentaa raporttia?</h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                Lue raportti yllä ensin — vastaa alle mihin haluat, tai kirjoita vapaasti mitä
                tekoäly ei osannut kysyä.
              </p>
              <ClarifyPanel busy={busy} requests={clarifications} onSubmit={startRound2} />
            </div>
          )}

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
      <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
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
    freeText: string
  ) => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [freeText, setFreeText] = useState('')
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
      <button
        onClick={() =>
          onSubmit(
            requests
              .map((r) => ({ id: r.id, question: r.question, answer: (answers[r.id] || '').trim() }))
              .filter((a) => a.answer),
            freeText.trim()
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
