import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CheckCircle, ArrowRight, Shield, Lock } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

export const HeroSection = () => {

  const bullets = [
    'Sem tecnicismos',
    '100% prático',
    'Método claro',
  ];

  return (
    <section className="relative min-h-[85svh] md:min-h-[90vh] flex items-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-navy-dark/50 md:bg-navy-dark/40" />
      </div>

      <div className="hidden md:block absolute top-20 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />

      <div className="container relative z-10 pt-10 pb-6 md:pt-24 md:pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal delay={0}>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground leading-[1.1] mb-4 md:mb-6">
              <span className="text-gradient-gold">2.500+ alunos</span>{' '}
              já usam IA no trabalho.{' '}
              Aprenda em 7 dias.
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="text-sm md:text-base lg:text-lg text-primary-foreground/80 max-w-xl mx-auto mb-5 md:mb-6 leading-relaxed">
              Chega de tutorial solto. Veja como pessoas reais usam IA — e aprenda a fazer igual.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 md:mb-8">
              {bullets.map((bullet, index) => (
                <div key={index} className="flex items-center gap-1.5 text-primary-foreground/90">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{bullet}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                variant="hero"
                size="lg"
                className="group w-full sm:w-auto text-base md:text-lg py-5 md:py-5 animate-pulse hover:animate-none"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Quero aprender IA na prática
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              <Button asChild variant="heroSecondary" size="default" className="w-full sm:w-auto">
                <a href="#modulos">Ver módulos</a>
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="mt-5 md:mt-6 pt-4 border-t border-primary-foreground/10">
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-2">
                <div className="flex items-center gap-1.5 text-primary-foreground/60">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium">Garantia 7 dias</span>
                </div>
                <div className="flex items-center gap-1.5 text-primary-foreground/60">
                  <Lock className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-medium">Pagamento seguro</span>
                </div>
              </div>
              <p className="text-primary-foreground/50 text-xs md:text-sm">
                Acesso imediato • 12x de R$41 • Cartão ou PIX
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <CheckoutDialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog} />
    </section>
  );
};
