import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CheckCircle, ArrowRight } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import realisGuiding from '@/assets/character/realis-guiding.png';

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
      <div className="container relative z-10 pt-16 pb-6 md:pt-24 md:pb-16">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Text content - ALWAYS FIRST on mobile */}
          <div className="text-center lg:text-left">
            {/* Title - Prominent and immediate */}
            <ScrollReveal delay={0}>
              <h1 className="font-display text-[1.75rem] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground leading-[1.15] mb-3 md:mb-6">
                Aprenda a usar{' '}
                <span className="text-gradient-gold">
                  IA de verdade
                </span>{' '}
                no seu dia a dia
              </h1>
            </ScrollReveal>

            {/* Subtitle - Compact */}
            <ScrollReveal delay={100}>
              <p className="text-sm md:text-base lg:text-lg text-primary-foreground/80 max-w-xl mx-auto lg:mx-0 mb-4 md:mb-6 leading-relaxed">
                Chega de tutorial solto. Veja como pessoas reais usam IA — e aprenda a fazer igual.
              </p>
            </ScrollReveal>

            {/* Bullets - Inline on mobile */}
            <ScrollReveal delay={150}>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-4 mb-5 md:mb-8">
                {bullets.map((bullet, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1.5 text-primary-foreground/90"
                  >
                    <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                    <span className="text-xs md:text-sm font-medium">{bullet}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* CTA Buttons - Prominent on mobile */}
            <ScrollReveal delay={200}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
                <Button asChild variant="hero" size="lg" className="group w-full sm:w-auto text-base md:text-lg py-4 md:py-5">
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
              <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-primary-foreground/10">
                <p className="text-primary-foreground/50 text-xs md:text-sm">Acesso imediato • 100% online • Certificado incluso</p>
              </div>
            </ScrollReveal>
          </div>

          {/* REALIS character - Smaller on mobile, positioned as support */}
          <div className="flex justify-center lg:justify-end mt-2 md:mt-0">
            <ScrollReveal delay={250} direction="right">
              <div className="relative">
                {/* Glow effect behind character */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-gold/10 to-transparent rounded-3xl blur-2xl scale-75" />
                
                {/* Character image in elegant card on mobile */}
                <div className="relative z-10 bg-navy-dark/30 backdrop-blur-sm rounded-2xl md:rounded-3xl p-2 md:p-0 md:bg-transparent border border-primary-foreground/10 md:border-0 shadow-lg md:shadow-none">
                  <img 
                    src={realisGuiding}
                    alt="REALIS - Mentor do Método IA Real"
                    className="w-[180px] sm:w-[220px] md:w-[320px] lg:w-[380px] xl:w-[420px] h-auto max-h-[200px] sm:max-h-[250px] md:max-h-none object-contain md:drop-shadow-2xl md:animate-float"
                    style={{ animationDuration: '6s' }}
                    loading="eager"
                  />
                </div>
                
                {/* Name badge - Hidden on smallest screens */}
                <div className="hidden sm:block absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-navy-dark/80 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-accent/30">
                  <span className="text-accent font-display font-bold text-xs tracking-wider">REALIS</span>
                  <span className="text-primary-foreground/60 text-[10px] md:text-xs ml-1.5 md:ml-2">Seu mentor</span>
                </div>
              </div>
            </ScrollReveal>
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
