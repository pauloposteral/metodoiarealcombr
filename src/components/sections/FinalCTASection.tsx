import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ArrowRight, Shield, Clock, Award, Loader2 } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import { useCheckout } from '@/hooks/useCheckout';

export const FinalCTASection = () => {
  const { handleCheckout, isLoading } = useCheckout();

  const guarantees = [
    { icon: Shield, text: 'Garantia de 7 dias' },
    { icon: Clock, text: 'Acesso vitalício' },
    { icon: Award, text: 'Certificado incluso' },
  ];

  return (
    <section className="relative py-10 md:py-16 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-navy-dark/75 md:bg-navy-dark/70" />
      </div>

      <div className="container px-4 md:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4 leading-tight">
              Comece agora a usar{' '}
              <span className="text-gradient-gold">IA de verdade</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="text-base md:text-lg text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Junte-se aos <strong className="text-gold">2.500+ alunos</strong> que já transformaram sua forma de trabalhar.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <Button
              variant="hero"
              size="lg"
              className="group text-base md:text-lg w-full sm:w-auto py-4 md:py-5"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Quero começar agora
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
            <p className="text-primary-foreground/50 text-xs md:text-sm mt-3">
              12x de R$41 • Cartão ou PIX • Acesso imediato
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-6 mt-6 border-t border-primary-foreground/10">
              {guarantees.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 text-primary-foreground/70">
                  <item.icon className="w-4 h-4 text-accent" />
                  <span className="text-xs md:text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
