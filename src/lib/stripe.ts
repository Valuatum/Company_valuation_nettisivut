import Stripe from 'stripe'

let cached: Stripe | null = null

/**
 * Returns a configured Stripe client, or null when STRIPE_SECRET_KEY is not set.
 * The checkout route degrades gracefully to a demo mode in that case so the
 * site is runnable without secrets.
 */
export function getStripe(): Stripe | null {
  if (cached) return cached
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  // Use the SDK's pinned API version (avoids hard-coding a version string that
  // drifts when the stripe package is upgraded).
  cached = new Stripe(key)
  return cached
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}
