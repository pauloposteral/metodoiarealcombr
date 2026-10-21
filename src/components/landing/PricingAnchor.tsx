import { COURSE_BENEFITS, COURSE_DISPLAY_PRICE, COURSE_PAYMENT_NOTE, COURSE_ACCESS_NOTE } from '@/lib/courseOffer';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, Award, CheckCircle, Sparkles, Banknote, Loader2, Lock, CreditCard } from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';
import { CheckoutDialog } from '@/components/landing/CheckoutDialog';

export const PricingAnchor = () => {
  const { handleCheckout, isLoading, showCheckoutDialog, setShowCheckoutDialog } = useCheckout();

  const included = COURSE_BENEFITS;

  return (
    <section className="py-10 md:py-16 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container px-4 md:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              Investimento
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Comece sua jornada{' '}
              <span className="text-gradient-gold">agora</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="max-w-lg mx-auto">
            <div className="relative bg-card border-2 border-accent/30 rounded-2xl p-6 md:p-8 shadow-[0_8px_40px_-8px_hsl(43_75%_55%_/_0.2)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-gold">
                  FORMAÇÃO COMPLETA
                </span>
              </div>

              <div className="text-center mb-5 pt-2"><p className="text-5xl font-display font-bold">{COURSE_DISPLAY_PRICE}</p><p className="mt-3 text-sm text-muted-foreground">{COURSE_PAYMENT_NOTE}</p></div>
              <div className="space-y-2.5 mb-5">
                {included.map((item, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full group text-base md:text-lg py-5"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Quero começar agora
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium">7 dias de garantia</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium">Acesso conforme a oferta</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium">Certificado</span>
                </div>
              </div>

              {/* Security badges */}
              <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-1 text-muted-foreground/60">
                  <Lock className="w-3 h-3 text-green-500" />
                  <span className="text-[10px]">SSL</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground/60">
                  <CreditCard className="w-3 h-3" />
                  <span className="text-[10px]">Pagamento no provedor</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground/60">
                  <Shield className="w-3 h-3" />
                  <span className="text-[10px]">Stripe</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">{COURSE_ACCESS_NOTE}</p>
          </div>
        </ScrollReveal>
      </div>
      <CheckoutDialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog} />
    </section>
  );
};
