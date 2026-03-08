import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  cancel_at: string | null;
  plans: {
    name: string;
    slug: string;
    features: any;
  } | null;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isActive: boolean;
  isPro: boolean;
  isPremium: boolean;
  isFree: boolean;
  loading: boolean;
  planSlug: string;
  openCheckout: (planSlug: string, billingPeriod: 'monthly' | 'yearly') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            id,
            plan_id,
            status,
            current_period_end,
            cancel_at,
            plans (
              name,
              slug,
              features
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (!error && data) {
          setSubscription(data as unknown as Subscription);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const planSlug = (subscription?.plans as any)?.slug || 'free';
  const isActive = subscription?.status === 'active';
  const isPro = isActive && planSlug === 'pro';
  const isPremium = isActive && planSlug === 'premium';
  const isFree = !isActive || planSlug === 'free';

  const openCheckout = async (planSlug: string, billingPeriod: 'monthly' | 'yearly') => {
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        action: 'create-checkout',
        planSlug,
        billingPeriod,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const openCustomerPortal = async () => {
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { action: 'customer-portal' },
    });

    if (error) throw error;
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return {
    subscription,
    isActive,
    isPro,
    isPremium,
    isFree,
    loading,
    planSlug,
    openCheckout,
    openCustomerPortal,
  };
}
