import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CheckCircle, ArrowRight } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import logo from '@/assets/logo-iareal.png';

export const HeroSection = () => {
  const bullets = [
    'Sem tecnicismos',
    '100% prático',
    'Método claro e aplicável',
    'Para pessoas e negócios reais',
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroBg})`,
        }}
      >
        <div className="absolute inset-0 bg-navy-dark/40" />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-gold-light/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="container relative z-10 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <ScrollReveal delay={0}>
            <img 
              src={logo} 
              alt="Método IA Real - Curso de Inteligência Artificial" 
              className="h-14 md:h-18 lg:h-20 mx-auto mb-10 drop-shadow-2xl"
            />
          </ScrollReveal>

          {/* Title */}
          <ScrollReveal delay={100}>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Método IA Real —{' '}
              <span className="text-gradient-gold">
                Inteligência Artificial
              </span>{' '}
              aplicada ao mundo real
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal delay={200}>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              Aprenda a usar a IA de forma prática para trabalhar melhor, criar mais, 
              vender mais e ganhar tempo — mesmo começando do zero.
            </p>
          </ScrollReveal>

          {/* Bullets */}
          <ScrollReveal delay={300}>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
              {bullets.map((bullet, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-primary-foreground/90"
                >
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="text-sm md:text-base font-medium">{bullet}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="hero" size="xl" className="group">
                Quero aprender IA na prática
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="heroSecondary" size="lg">
                Ver conteúdo completo
              </Button>
            </div>
          </ScrollReveal>

          {/* Trust indicators */}
          <ScrollReveal delay={500}>
            <div className="mt-12 pt-8 border-t border-primary-foreground/10">
              <p className="text-primary-foreground/50 text-sm mb-4">Acesso imediato • 100% online • Certificado incluso</p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-accent rounded-full" />
        </div>
      </div>
    </section>
  );
};
