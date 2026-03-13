import { useState, useEffect } from 'react';
import { X, ArrowRight, Shield, Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/hooks/useCheckout';
import { CheckoutDialog } from '@/components/landing/CheckoutDialog';

export const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { handleCheckout, isLoading, showCheckoutDialog, setShowCheckoutDialog } = useCheckout();

  useEffect(() => {
    const hasShown = sessionStorage.getItem('exit_popup_shown');
    if (hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsVisible(true);
        sessionStorage.setItem('exit_popup_shown', 'true');
      }
    };

    if (window.innerWidth > 768) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-navy-dark/70 backdrop-blur-sm" onClick={() => setIsVisible(false)} />
      <div className="relative bg-card border border-accent/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_20px_60px_-12px_hsl(43_75%_55%_/_0.3)] animate-scale-in">
        <button onClick={() => setIsVisible(false)} className="absolute top-3 right-3 p-1.5 hover:bg-muted rounded-full transition-colors" aria-label="Fechar">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="text-center">
          <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-7 h-7 text-accent" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">Espere! 🎁</h3>
          <p className="text-muted-foreground mb-4">
            Que tal um <strong className="text-accent">desconto extra de 10%</strong> para começar sua jornada com IA?
          </p>
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">Use o cupom:</p>
            <p className="text-2xl font-display font-bold text-accent tracking-wider mt-1">IAREAL10</p>
          </div>
          <Button
            variant="hero"
            size="lg"
            className="w-full group text-base"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Aproveitar desconto
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs">Garantia de 7 dias • Cartão ou PIX</span>
          </div>
        </div>
      </div>
      <CheckoutDialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog} />
    </div>
  );
};
