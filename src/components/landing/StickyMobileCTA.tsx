import { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCheckout } from '@/hooks/useCheckout';
import { CheckoutDialog } from '@/components/landing/CheckoutDialog';

export const StickyMobileCTA = () => {
  const isMobile = useIsMobile();
  const { handleCheckout, isLoading, showCheckoutDialog, setShowCheckoutDialog } = useCheckout();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_hsl(var(--navy-dark)/0.15)] animate-fade-in">
      <Button
        variant="hero"
        size="lg"
        className="w-full group text-base py-4"
        onClick={handleCheckout}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Quero começar • 12x R$41
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
      <p className="text-center text-[10px] text-muted-foreground mt-1.5">
        Cartão ou PIX • Garantia de 7 dias • Acesso imediato
      </p>
    </div>
  );
};
