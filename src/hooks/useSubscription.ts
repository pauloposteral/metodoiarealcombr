import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Stripe product → plan mapping
const PLAN_TIERS = {
  pro: {
    monthly: { priceId: 'price_1T8qngK7VFRW1YcZdgbfLP0b', productId: 'prod_U74xdTn7S2EmAa' },
    yearly: { priceId: 'price_1T8qr8K7VFRW1YcZwksylyOi', productId: 'prod_U751PkS6yrUxaR' },
  },
  premium: {
    monthly: { priceId: 'price_1T8qsLK7VFRW1YcZcr24abYp', productId: 'prod_U7523UwWWJ0vkb' },
    yearly: { priceId: 'price_1T8quAK7VFRW1YcZrhxEjAoR', productId: 'prod_U754V082Dlgfh1' },
  },
} as const;

interface UseSubscriptionReturn {
  subscribed: boolean;
  plan: string;
  subscriptionEnd: string | null;
  loading: boolean;
  isPro: boolean;
  isPremium: boolean;
  isFree: boolean;
  checkSubscription: () => Promise<void>;
  openCheckout: (planSlug: 'pro' | 'premium', billingPeriod: 'monthly' | 'yearly') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscribed, setSubscribed] = useState(false);
  const [plan, setPlan] = useState('free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscribed(false);
        setPlan('free');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;

      setSubscribed(data?.subscribed ?? false);
      setPlan(data?.plan ?? 'free');
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (err) {
      console.error('Error checking subscription:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();

    // Auto-refresh every 60s
    const interval = setInterval(checkSubscription, 60_000);

    // Also refresh on auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [checkSubscription]);

  const openCheckout = async (planSlug: 'pro' | 'premium', billingPeriod: 'monthly' | 'yearly') => {
    const tier = PLAN_TIERS[planSlug]?.[billingPeriod];
    if (!tier) throw new Error(`Invalid plan: ${planSlug}/${billingPeriod}`);

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId: tier.priceId },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  const openCustomerPortal = async () => {
    const { data, error } = await supabase.functions.invoke('customer-portal');
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  return {
    subscribed,
    plan,
    subscriptionEnd,
    loading,
    isPro: subscribed && plan === 'pro',
    isPremium: subscribed && plan === 'premium',
    isFree: !subscribed || plan === 'free',
    checkSubscription,
    openCheckout,
    openCustomerPortal,
  };
}

export { PLAN_TIERS };
