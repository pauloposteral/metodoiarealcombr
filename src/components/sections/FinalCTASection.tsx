import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ArrowRight, Shield, Clock, Award } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

export const FinalCTASection = () => {
  const guarantees = [
    { icon: Shield, text: 'Garantia de 7 dias' },
    { icon: Clock, text: 'Acesso vitalício' },
    { icon: Award, text: 'Certificado incluso' },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-navy-dark/60" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-20 w-56 h-56 bg-gold-light/10 rounded-full blur-2xl" />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <span className="inline-block px-4 py-2 bg-accent/20 text-accent font-semibold text-sm rounded-full mb-6">
              Sua Oportunidade
            </span>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              Comece agora a usar a{' '}
              <span className="text-gradient-gold">IA de forma real</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Enquanto muitos ainda observam, outros já estão aplicando. 
              A diferença está na ação.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex flex-col items-center gap-6 mb-10">
              <Button asChild variant="hero" size="xl" className="group text-lg">
                <a href="https://payfast.greenn.com.br/152833" target="_blank" rel="noopener noreferrer">
                  Entrar no Método IA Real
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <p className="text-primary-foreground/50 text-sm">
                Acesso imediato após a confirmação do pagamento
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="flex flex-wrap justify-center gap-6 pt-8 border-t border-primary-foreground/10">
              {guarantees.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-primary-foreground/70"
                >
                  <item.icon className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
