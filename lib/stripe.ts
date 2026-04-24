import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set — Stripe features disabled')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia' as any,
      typescript: true,
    })
  : null

// Map plan IDs to Stripe Price IDs (set via env vars)
export const PLAN_PRICE_MAP: Record<string, { monthly: string; annual: string }> = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
  },
  expert: {
    monthly: process.env.STRIPE_PRICE_EXPERT_MONTHLY || '',
    annual: process.env.STRIPE_PRICE_EXPERT_ANNUAL || '',
  },
}

export function isStripeEnabled(): boolean {
  return !!stripe
}
