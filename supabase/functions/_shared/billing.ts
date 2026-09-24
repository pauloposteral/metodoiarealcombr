export const COURSE_PRICE_ID = 'price_1TAKj1K7VFRW1YcZZSZSsb3n';
export const SUBSCRIPTION_PRICES: Record<string, 'pro' | 'premium'> = {
  price_1T8qngK7VFRW1YcZdgbfLP0b: 'pro',
  price_1T8qr8K7VFRW1YcZwksylyOi: 'pro',
  price_1T8qsLK7VFRW1YcZcr24abYp: 'premium',
  price_1T8quAK7VFRW1YcZrhxEjAoR: 'premium',
};

export function checkoutProduct(priceId: unknown, mode: unknown) {
  if (typeof priceId !== 'string') return null;
  if (mode === 'payment' && priceId === COURSE_PRICE_ID) return { kind: 'course', plan: null };
  if (mode === 'subscription' && Object.hasOwn(SUBSCRIPTION_PRICES, priceId)) {
    return { kind: 'subscription', plan: SUBSCRIPTION_PRICES[priceId] };
  }
  return null;
}

export function stripeId(value: string | { id: string } | null | undefined): string | null {
  return typeof value === 'string' ? value : value?.id || null;
}

export function billingPeriod(subscription: {
  current_period_start?: number; current_period_end?: number;
  items?: { data: { current_period_start?: number; current_period_end?: number }[] };
}) {
  const item = subscription.items?.data[0];
  const iso = (value: number | undefined) => Number.isFinite(value) ? new Date(value! * 1000).toISOString() : null;
  return {
    start: iso(item?.current_period_start ?? subscription.current_period_start),
    end: iso(item?.current_period_end ?? subscription.current_period_end),
  };
}
