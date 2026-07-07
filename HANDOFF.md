# Handoff — 2026-07-07 (read this first)

Commit `c9565fa` plus the latest continuation commit. CEO feedback on `/testi`:
never saw the round-1 report (only clarifying questions + round-2 result), and
no free-text company entry. Fixed in `src/expert/ExpertApp.tsx` +
`src/expert/expertApi.ts`; continuation also forwards `industry_text`,
`industry_code`, `industry_id`, and `industry_tree` from `/api/company-search`
to the backend and adds an optional delivery email field for the new backend
Resend scaffold. Full detail, verification notes, and what's still owed (real
live click-through, Resend env configuration) are written up in the **backend
repo's** `../AI-company-valuation-raportti/HANDOFF.md` (read that one first,
this session touched both repos as one unit). Build + typecheck clean
(`npm.cmd run build` on Windows; plain `npm run build` is blocked by local
PowerShell policy). ⛔ Do not trigger a real report generation from this site
against prod without asking the user first — see that repo's `CLAUDE.md`.

Also: `next dev` (Turbopack) fails on this machine's real repo path (spaces
in `Lauri H` / `Valuatum projektit`) — see the backend HANDOFF's browser-
tooling notes for the spaceless-copy workaround (`C:\dev\nettisivut`,
already wired into `.claude/launch.json`).

---

# Handoff — 2026-07-03

Pushed as commit `f480342` on `main`. Build + typecheck clean, purchase flow
verified end-to-end against the live backend. Read this before touching
`/yritys`, `/kassa`, `/tilinpaatokset`, `/laskuri`, `/kertoimet`, or
`src/lib/pricing.ts`.

---

# ⭐ 2026-07-04 — Expert self-serve `/asiantuntija` + paid-first funnel (read first)

This Next.js site is the PUBLIC surface. The valuation **backend** is a separate
FastAPI repo (`../AI-company-valuation-raportti/pipeline-runner/backend`, live at
`NEXT_PUBLIC_ORDERS_API` = `valu-pipeline-production-88f2.up.railway.app`). Read
that repo's HANDOFF "CURRENT STATE + ARCHITECTURE" section for the full picture.

## New: `/asiantuntija` — expert self-serve (LIVE)
- `src/app/asiantuntija/page.tsx` (noindex) → `src/expert/ExpertApp.tsx` (whole
  flow) + `src/expert/expertApi.ts` (bearer calls to the backend).
- Flow: enter an `exp_…` invite key (stored in localStorage) → `GET
  /api/expert/me` validates + shows credits ("krediittiä") → pick a company from
  `GET /api/companies` (the operator's pre-fetched companies) → `POST
  /api/expert/generate {fid,...}` → poll `GET /api/runs/{rid}` → report shown by
  fetching `report.html?force=1` with the bearer and injecting via `<iframe
  srcdoc>` (iframe can't send Authorization) → round-2 clarify panel (free).
- **Why the picker (not free search):** the backend needs a Valuatum **FID**,
  which only exists for pre-fetched companies. See the FID blocker below.
- Backend enforces the per-key quota + run ownership; the key is a scoped,
  capped credential (fine to hold client-side).

## Paid-first funnel (B) — DONE this session
- **Hero** (`src/components/sections/HeroSection.tsx`): the free order form
  (`HeroOrderForm`, now orphaned/unused) was replaced with the real
  `CompanySearch` typeahead → routes to `/yritys/[id]` → `BuyBox` → **Stripe**.
- **All "Tilaa raportti" CTAs** (`#tilaa`) across nav, pricing cards, content
  pages, blog, calculator, kertoimet, cancel page → now `/yritys` (paid flow),
  so the "79 €" promise and the CTA destination agree (was a free-form leak).
- **Delivery SLA** unified everywhere → "30–60 minuutissa" (was "saman
  työpäivän aikana" / "1–2 arkipäivässä"). The pipeline is automated now.
- Sample-report dead links fixed: real PDF links, placeholders show "Esimerkki
  tulossa" (`SampleReportsSection.tsx`).

## ⚠️ FID blocker + what's NOT built
- Self-serve works today ONLY for the operator's pre-fetched companies (they
  have stored FIDs). Arbitrary-company self-serve needs a Y-tunnus→FID resolver
  from Valuatum's tech team (see backend HANDOFF).
- **NOT built:** paid customers still get operator-fulfilled reports (BuyBox →
  Stripe → `/api/orders` → operator). The designed end state is paid →
  auto-generate → email a **signed report link** (`/raportti/{id}?t=…`, no
  accounts) → self-serve refine. Needs the FID resolver first.
- The `199 €` 3-report bundle still has no checkout path in
  `pricing.ts`/`checkout` route.

## What happened this session: repo merge

Two site repos existed for this product:

- **This repo** — design system (CSS tokens, `Reveal`, `ContentPage`,
  content-driven sections), Finnish copy, already live-ish with a working
  hero order form posting to the report backend.
- **`../company-valuation-site`** (github.com/ValuatumOy/company-valuation-site)
  — weaker design but had the actual purchase functionality: company
  search, Stripe checkout, statement upload, valuation calculator, market
  multiples. English copy, Next 15, sample-stubbed data layer.

Decision: port the functionality repo's features INTO this one (design is
systemic and expensive to redo; functionality ports as modular units). Ran
as a 4-agent workflow, each agent owning a disjoint file set, each told to
follow this repo's design tokens exactly (`bg-forest` dark hero sections,
`green`/`green-deep` buttons, `rounded-3xl border-mist` cards, `Reveal` for
scroll-in, Finnish copy, the existing honesty-first tone from
`PRODUCT.md`).

`../company-valuation-site` is now superseded — it was only cloned locally
as a porting reference, not otherwise touched. Consider archiving it on
GitHub so nobody edits it by mistake.

## New routes

- **`/yritys`** — company search (dropdown), links to `/yritys/[id]`.
- **`/yritys/[id]`** — company page: dark hero (name, Y-tunnus, city,
  industry, badge for whether we already hold financials), then `BuyBox`
  (purchase card) in the light body.
- **`/api/checkout`** + **`/kassa/valmis`** + **`/kassa/peruutettu`** —
  Stripe Checkout. Runs in **demo mode** (no real charge, redirects
  straight to the success page with `?demo=1`) whenever `STRIPE_SECRET_KEY`
  is unset — which it currently is everywhere. `/kassa/valmis` is a server
  component: verifies the Stripe session server-side (paid flow) or reads
  query params (demo flow), then POSTs the order to the report backend.
- **`/tilinpaatokset`** — info page explaining the two no-data-on-file
  paths (upload yourself / we fetch via Creditsafe). **`/tilinpaatokset/lataa`**
  — post-payment upload page, renders `UploadForm`.
- **`/laskuri`** — indicative valuation calculator (EV/EBITDA multiples),
  honesty disclaimer + CTA to the real report.
- **`/kertoimet`** — industry multiples reference table.

## The backend connection (the actual point of this work)

`src/lib/orders.ts` → `postOrder({company, email, user_input})` POSTs to
`${NEXT_PUBLIC_ORDERS_API}/api/orders` (defaults to
`https://valu-pipeline-production-88f2.up.railway.app`) — the **same**
endpoint the hero order form already used. Three flows now call it:

1. `/kassa/valmis` after a verified/demo Stripe payment — `user_input`
   carries `MAKSETTU (Stripe <session_id>), tuote: <kind>, hinta: <eur>`
   (or `KOEMAKSU (ei veloitusta), ...` in demo mode).
2. `UploadForm` after a successful statement upload — `user_input` carries
   `TILINPÄÄTÖKSET LADATTU (<n> tiedostoa), Stripe session: <id|demo>`.
3. The original `HeroOrderForm` on the landing page — unchanged.

Every one of these becomes a row the operator sees in the pipeline app's
Tilaukset view. **Verified live this session**: ran the actual demo
checkout flow (search → Supercell Oy → 79€ existing-report purchase → demo
redirect → `/kassa/valmis`), confirmed via `GET /api/orders` on the Railway
backend that the order landed with `"user_input":"KOEMAKSU (ei veloitusta),
tuote: existing, hinta: 79,00 €"` and the correct email — then marked that
test row `spam` via `PATCH /api/orders/{id}`.

## Pricing (user decision this session)

79€ base / 99€ import-your-own-statements (79€ if you allow data sharing)
/ 129€ we-fetch-it-for-you. Lives ONLY in `src/lib/pricing.ts`
(`PRICES.{existingReport,importReport,shareDiscount,creditsafeReport}`,
all in EUR cents, all env-overridable). The landing page's pricing card
(`src/content/fi/home.json` → `pricing` section, `plan-single`) has a
feature-list line disclosing the import/creditsafe surcharges — if you
change a price in `pricing.ts`, update that copy too, it's not
auto-generated from the same source.

## Known gaps / follow-ups

1. **No Stripe webhook.** `/kassa/valmis` posts the order when the user's
   browser lands on the success page. If they close the tab before it
   loads, or the server restarts (in-memory dedupe `Set` is per-instance),
   the order never gets posted even though Stripe was charged. A
   `checkout.session.completed` webhook handler is the durable fix.
2. **Import uploads aren't stored.** `/api/import` validates and
   acknowledges files but doesn't persist them (`ponytail:` comment marks
   this explicitly). When wiring real storage, note Vercel's serverless
   request-body limit (~4.5MB) will reject anything near the UI's stated
   20MB/file cap — needs direct-to-blob client uploads, not a body-parsed
   API route.
3. **`STRIPE_SECRET_KEY` and `NEXT_PUBLIC_SITE_URL` are not set on
   Vercel.** Everything works in demo mode; real payments won't happen
   until these are set.
4. **Company search is a bundled sample dataset** (`src/lib/companies.ts`
   — Rovio, Wolt, Supercell, Relex, a handful more), not live Valuatum
   data. There's a commented `VALUATUM_DATA_API_URL`/`VALUATUM_DATA_API_KEY`
   proxy hook already in that file for when a real endpoint exists. Sample
   figures were ported as-is from the source repo — worth a sanity check
   before any of this is customer-facing.
5. Everything from the 2026-07-02 handoff (sample-report PDFs still
   partially dead-linked, no human proofread pass on the yrityskauppa/
   sukupolvenvaihdos/blog copy, `metadataBase` domain unconfirmed) is
   still open — this session didn't touch that content.

## Backend context (sibling repo)

The report-generation pipeline lives in
`/Users/laurihynonen/Valuatum projektit/AI-company-valuation-raportti` — 7
commits landed there this same session (validator bug fixes, prompt
improvements from a Supercell report audit, a new per-employee report
table). See that repo's own `HANDOFF.md` for detail. Nothing there
conflicts with this work, but the `/api/orders` contract this site depends
on lives in that repo's `app/main.py` / `app/store.py` — if orders stop
showing up, check there first.
