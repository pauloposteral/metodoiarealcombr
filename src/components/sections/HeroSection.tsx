import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CheckCircle, ArrowRight } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import { SocialProofCounter } from '@/components/landing/SocialProofCounter';


export const HeroSection = () => {
  const bullets = [
    'Sem tecnicismos',
    '100% prático',
    'Método claro',
  ];

  return (
    <section className="relative min-h-[100svh] md:min-h-screen flex items-center overflow-hidden">
      {/* Background with parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-navy-dark/50 md:bg-navy-dark/40" />
      </div>

      {/* Floating elements - hidden on mobile for performance */}
      <div className="hidden md:block absolute top-20 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="hidden md:block absolute bottom-20 left-10 w-48 h-48 bg-gold-light/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="container relative z-10 pt-20 pb-6 md:pt-28 md:pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Text content - Centered */}
          <div className="text-center">
            {/* Title - With specific number */}
            <ScrollReveal delay={0}>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground leading-[1.1] mb-4 md:mb-6">
                <span className="text-gradient-gold">2.500+ alunos</span>{' '}
                já usam IA no trabalho.{' '}
                Aprenda em 7 dias.
              </h1>
            </ScrollReveal>

            {/* Subtitle - Compact */}
            <ScrollReveal delay={100}>
              <p className="text-sm md:text-base lg:text-lg text-primary-foreground/80 max-w-xl mx-auto mb-5 md:mb-6 leading-relaxed">
                Chega de tutorial solto. Veja como pessoas reais usam IA — e aprenda a fazer igual.
              </p>
            </ScrollReveal>

            {/* Bullets - Inline on mobile */}
            <ScrollReveal delay={150}>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 md:mb-8">
                {bullets.map((bullet, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1.5 text-primary-foreground/90"
                  >
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">{bullet}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* CTA Buttons - Prominent */}
            <ScrollReveal delay={200}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button asChild variant="hero" size="lg" className="group w-full sm:w-auto text-base md:text-lg py-5 md:py-5">
                  <a href="https://payfast.greenn.com.br/152833" target="_blank" rel="noopener noreferrer">
                    Quero aprender IA na prática
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                <Button asChild variant="heroSecondary" size="default" className="w-full sm:w-auto">
                  <a href="#modulos">
                    Ver módulos
                  </a>
                </Button>
              </div>
            </ScrollReveal>

            {/* Trust indicators - Compact */}
            <ScrollReveal delay={300}>
              <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-primary-foreground/10">
                <p className="text-primary-foreground/50 text-xs md:text-sm">Acesso imediato • 100% online • Certificado incluso</p>
              </div>
            </ScrollReveal>

            {/* Social proof counter */}
            <SocialProofCounter />
          </div>
        </div>
      </div>

      {/* Scroll indicator - Hidden on mobile */}
      <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-accent rounded-full" />
        </div>
      </div>
    </section>
  );
};
