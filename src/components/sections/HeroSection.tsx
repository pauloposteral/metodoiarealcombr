import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CheckCircle, ArrowRight } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import logo from '@/assets/logo-iareal.png';
import realisGuiding from '@/assets/character/realis-guiding.png';

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
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-navy-dark/40" />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-gold-light/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="container relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Logo */}
            <ScrollReveal delay={0}>
              <img 
                src={logo} 
                alt="Método IA Real - Curso de Inteligência Artificial" 
                className="h-[100px] sm:h-[120px] mx-auto lg:mx-0 mb-8 drop-shadow-2xl"
              />
            </ScrollReveal>

            {/* Title */}
            <ScrollReveal delay={100}>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-tight mb-6">
                Aprenda a usar{' '}
                <span className="text-gradient-gold">
                  IA de verdade
                </span>{' '}
                no seu dia a dia
              </h1>
            </ScrollReveal>

            {/* Subtitle */}
            <ScrollReveal delay={200}>
              <p className="text-base md:text-lg text-primary-foreground/80 max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
                Chega de tutorial solto. Aqui você vê como pessoas reais usam IA para 
                criar, trabalhar e resolver problemas — e aprende a fazer igual.
              </p>
            </ScrollReveal>

            {/* Bullets */}
            <ScrollReveal delay={300}>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4 mb-8">
                {bullets.map((bullet, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 text-primary-foreground/90"
                  >
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">{bullet}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Button asChild variant="hero" size="xl" className="group">
                  <a href="https://payfast.greenn.com.br/152833" target="_blank" rel="noopener noreferrer">
                    Quero aprender IA na prática
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                <Button asChild variant="heroSecondary" size="lg">
                  <a href="#modulos">
                    Ver conteúdo completo
                  </a>
                </Button>
              </div>
            </ScrollReveal>

            {/* Trust indicators */}
            <ScrollReveal delay={500}>
              <div className="mt-8 pt-6 border-t border-primary-foreground/10">
                <p className="text-primary-foreground/50 text-sm">Acesso imediato • 100% online • Certificado incluso</p>
              </div>
            </ScrollReveal>
          </div>

          {/* Right side - REALIS character */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <ScrollReveal delay={200} direction="right">
              <div className="relative">
                {/* Glow effect behind character */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-gold/10 to-transparent rounded-full blur-3xl scale-75" />
                <img 
                  src={realisGuiding}
                  alt="REALIS - Mentor do Método IA Real"
                  className="relative z-10 w-[280px] sm:w-[320px] md:w-[380px] lg:w-[420px] xl:w-[480px] h-auto drop-shadow-2xl animate-float"
                  style={{ animationDuration: '6s' }}
                />
                {/* Name badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-navy-dark/80 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30">
                  <span className="text-accent font-display font-bold text-sm tracking-wider">REALIS</span>
                  <span className="text-primary-foreground/60 text-xs ml-2">Seu mentor de IA</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
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
