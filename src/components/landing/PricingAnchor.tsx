import { ScrollReveal } from '@/components/ScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, Award, CheckCircle, Sparkles, Banknote, Loader2 } from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';

export const PricingAnchor = () => {
  const { handleCheckout, isLoading } = useCheckout();

  const included = [
    'Acesso vitalício ao curso completo',
    'Biblioteca com 100+ prompts prontos',
    'Comunidade exclusiva de alunos',
    'Certificado de conclusão',
    'Atualizações futuras grátis',
    'Aula bônus: Como Estudar com IA',
    'Aula bônus: Como Ensinar com IA',
    'Suporte na comunidade',
  ];

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
                  MAIS POPULAR
                </span>
              </div>

              <div className="text-center mb-5 pt-2">
                <p className="text-sm text-muted-foreground mb-1">De</p>
                <p className="text-2xl font-bold text-muted-foreground line-through">R$ 997</p>
                <p className="text-sm text-accent font-semibold mb-2">Desconto de 50% por tempo limitado</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-sm text-muted-foreground">por</span>
                  <span className="text-5xl md:text-6xl font-display font-bold text-foreground">R$497</span>
                </div>
                <p className="text-lg font-semibold text-accent mt-2">ou 12x de R$ 41,42</p>
                <p className="text-xs text-muted-foreground mt-1">no cartão de crédito sem juros</p>
              </div>

              {/* PIX badge */}
              <div className="flex items-center justify-center gap-2 mb-5 p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Banknote className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-500">PIX: R$ 447 (10% off extra)</span>
              </div>

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
                  <span className="text-xs font-medium">Acesso vitalício</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium">Certificado</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Valor total dos bônus: <span className="line-through">R$ 688</span>
              </p>
              <p className="text-sm text-accent font-semibold">
                Tudo incluído no acesso por R$ 497
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
