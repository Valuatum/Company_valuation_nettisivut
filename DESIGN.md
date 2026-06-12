# DESIGN.md — Valuatum Arvonmääritys

Visual direction adapted from aiequityreports.com (Valuatum's own product) —
premium financial research, dark/light contrast, disciplined palette.

## Colors (CSS vars in globals.css, mapped to Tailwind via @theme)

- `--green` #3D9E72 — primary actions, accents
- `--green-deep` #2A7452 — hover, text on light green
- `--green-light` #6DBFA0 — accents on dark
- `--green-mist` #E3F5EE / `--green-faint` #F2FAF6 — tinted surfaces
- `--forest` #1B3028 — dark hero/section background
- `--charcoal` #1A2420 — text, footer; `--charcoal-mid` #2C3832 body text
- `--steel` #8A9590 — muted text; `--mist` #E2E9E5 borders; `--off-white` #F4F7F5 alt sections
- `--gold` #C8963E + `--gold-faint` #FDF6E8 — launch badge, honesty notes
- `--lime` #C8FF31 — logo mark only

## Typography

Inter (300–700). Headings font-light (300), tracking -0.02em.
H1 ~3.4rem, H2 4xl–5xl. Body 15–17px font-light, relaxed leading.
Eyebrows: 13px semibold uppercase tracking 0.14em, green-deep (light bg) /
green-light (dark bg).

## Components

- Cards: rounded-3xl (24px), border mist, hover -translate-y-1 + soft shadow
- Buttons/CTAs: pill (rounded-full), green bg → green-deep hover
- Badges/chips: pill, green-mist bg + green-deep text
- Dark sections: hero-pattern grid texture + hero-glow radial green

## Section rhythm

py-24 lg:py-32, max-w-7xl px-6 lg:px-10. Background alternation:
forest (hero) → off-white → white → forest (comparison) → white → off-white →
white (pricing) → off-white (methodology) → white (FAQ) → forest (final CTA) → charcoal (footer).

## Motion

Scroll reveal: opacity + translateY(24px), 0.8s cubic-bezier(0.4,0,0.2,1),
staggered 80–120ms; IntersectionObserver in `Reveal.tsx`. Method bars animate
width. FAQ accordion grid-rows transition 0.35s. Respect prefers-reduced-motion.
No gimmicks.

## Imagery

- `/images/forest-fog.jpg` — hero bg, 25% opacity under forest gradient
- `/images/contract.jpg` — final CTA bg, 20% opacity
- `/images/boardroom.jpg` — methodology side image with forest gradient overlay
- Logo `/logo.svg` — lime Valuatum mark
