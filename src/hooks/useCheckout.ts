import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { COURSE_PRICE_ID } from '@/lib/constants';

export const useCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

  const handleCheckout = async () => {
    // Meta Pixel tracking
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: 'Método IA Real',
        currency: 'BRL',
        value: 497,
      });
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Open checkout dialog instead of redirecting
      setShowCheckoutDialog(true);
      return;
    }

    // User is authenticated, go straight to Stripe
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: COURSE_PRICE_ID, mode: 'payment' },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return { handleCheckout, isLoading, showCheckoutDialog, setShowCheckoutDialog };
};
