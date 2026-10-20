type ReturnedSession = { access_token?: string; user?: { id?: string } } | null | undefined;
export type PurchaseSessionState = 'authenticated' | 'confirmation-pending' | 'session-missing';

/** A signup user object is not a session. The backend still validates every checkout request. */
export function purchaseSessionState(mode: 'login' | 'signup', session: ReturnedSession): PurchaseSessionState {
  if (session?.access_token && session.user?.id) return 'authenticated';
  return mode === 'signup' ? 'confirmation-pending' : 'session-missing';
}

/** This project uses Stripe-hosted Checkout; do not redirect to an arbitrary response URL. */
export function safeCheckoutDestination(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'checkout.stripe.com' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
