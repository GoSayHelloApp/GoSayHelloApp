// `pure` entry exposes setLoadParameters and only loads Stripe.js on first use.
import { loadStripe } from "@stripe/stripe-js/pure";
import type { Stripe, StripeConstructorOptions } from "@stripe/stripe-js";

// Stop Stripe.js from injecting its persistent "advanced fraud detection"
// iframe (the stray element that lingers on the page after checkout). Must be
// called before loadStripe(). Radar fraud protection still runs server-side.
try {
  loadStripe.setLoadParameters({ advancedFraudSignals: false });
} catch {
  /* older stripe-js without setLoadParameters — no-op */
}

/**
 * Single source of truth: the Stripe publishable key lives ONLY in `.env` as
 * REACT_APP_STRIPE_PUBLISHABLE_KEY. Everything reads it from here.
 */
const PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ?? "";

if (!PUBLISHABLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[stripe] REACT_APP_STRIPE_PUBLISHABLE_KEY is not set — checkout will not work."
  );
}

/** Re-export so other modules can read the key from this one place if needed. */
export const STRIPE_PUBLISHABLE_KEY = PUBLISHABLE_KEY;

let promise: Promise<Stripe | null> | null = null;

// Disable the test-mode "sandbox assistant" floating pill (bottom-right).
// (developerTools is newer than the bundled types, so cast the options.)
const STRIPE_OPTIONS = {
  developerTools: { assistant: { enabled: false } },
} as unknown as StripeConstructorOptions;

/** Lazily load Stripe.js once. */
export function getStripe(): Promise<Stripe | null> {
  if (!promise) promise = loadStripe(PUBLISHABLE_KEY, STRIPE_OPTIONS);
  return promise;
}
