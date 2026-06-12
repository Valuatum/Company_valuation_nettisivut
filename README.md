# Valuatum AI-arvonmääritysraportti — landing page

Finnish landing page for Valuatum's AI-assisted company valuation report.
Next.js 16 (App Router) + Tailwind v4, static-first, deployed on Vercel.
Will later move under valuation.fi.

## Develop

```bash
npm install
npm run dev
```

## Content editing (no code needed)

All page copy lives in JSON under `src/content/`:

- `src/content/fi/home.json` — all sections of the front page
- `src/content/site.json` — nav, footer, contact, theme

Built-in editor: open `/login` (password: `EDITOR_PASSWORD` env, dev default
`valuatum-editor`) → `/editor`. Save draft = preview in your browser only;
Publish = writes the JSON files. Note: on Vercel the filesystem is ephemeral —
for production persistence commit content changes to git (see TODO in
`src/app/api/editor/publish/route.ts`).

## Backend integration TODOs (search the code for `TODO(backend)`)

- Company search API (name / Y-tunnus lookup, PRH/YTJ)
- Stripe checkout per pricing plan
- Report generation + email delivery (current flow: hero form composes a
  mailto: to company-valuation@valuatum.com)
- Real sample report PDF links in `src/content/fi/home.json` (`pdfUrl` fields)

## Future (not in MVP)

- Automatic in-browser report generation
- Programmatic SEO company pages — only after real search/generation exists

See `PRODUCT.md` (positioning, tone) and `DESIGN.md` (design system).
