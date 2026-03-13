import { ScrollReveal } from '@/components/ScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, Award, CheckCircle, Sparkles } from 'lucide-react';

export const PricingAnchor = () => {
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
    <section className="py-12 md:py-20 lg:py-28 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container px-4 md:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              Investimento
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Comece sua jornada{' '}
              <span className="text-gradient-gold">agora</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="max-w-lg mx-auto">
            <div className="relative bg-card border-2 border-accent/30 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_-8px_hsl(43_75%_55%_/_0.2)]">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-gold">
                  MAIS POPULAR
                </span>
              </div>

              {/* Price */}
              <div className="text-center mb-6 pt-2">
                <p className="text-sm text-muted-foreground mb-1">De</p>
                <p className="text-2xl md:text-3xl font-bold text-muted-foreground line-through">
                  R$ 997
                </p>
                <p className="text-sm text-accent font-semibold mb-2">Desconto de 50% por tempo limitado</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-sm text-muted-foreground">por</span>
                  <span className="text-5xl md:text-6xl font-display font-bold text-foreground">
                    R$497
                  </span>
                </div>
                <p className="text-lg md:text-xl font-semibold text-accent mt-2">
                  ou 12x de R$ 41,42
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  no cartão de crédito sem juros
                </p>
              </div>

              {/* Included */}
              <div className="space-y-3 mb-6">
                {included.map((item, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button asChild variant="hero" size="lg" className="w-full group text-base md:text-lg py-5">
                <a href="https://payfast.greenn.com.br/152833" target="_blank" rel="noopener noreferrer">
                  Quero começar agora
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>

              {/* Guarantees */}
              <div className="flex flex-wrap justify-center gap-4 mt-5 pt-5 border-t border-border/50">
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

            {/* Total value */}
            <ScrollReveal delay={200}>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Valor total dos bônus: <span className="line-through">R$ 688</span>
                </p>
                <p className="text-sm text-accent font-semibold">
                  Tudo incluído no acesso por R$ 497
                </p>
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
