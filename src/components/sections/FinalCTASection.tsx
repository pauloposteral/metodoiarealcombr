import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ArrowRight, Shield, Clock, Award, Users, Crown, Sparkles } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import realisGuiding from '@/assets/character/realis-guiding.png';

export const FinalCTASection = () => {
  const guarantees = [
    { icon: Shield, text: 'Garantia de 7 dias' },
    { icon: Clock, text: 'Acesso vitalício' },
    { icon: Award, text: 'Certificado incluso' },
  ];

  const premiumFeatures = [
    { icon: Users, text: 'Comunidade Exclusiva de Membros' },
    { icon: Crown, text: 'Networking com outros alunos' },
    { icon: Sparkles, text: 'Conteúdo e suporte premium' },
  ];

  return (
    <section className="relative py-12 md:py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-navy-dark/75 md:bg-navy-dark/70" />
      </div>

      {/* Decorative elements - Hidden on mobile for performance */}
      <div className="hidden md:block absolute top-10 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="hidden md:block absolute bottom-10 left-20 w-56 h-56 bg-gold-light/10 rounded-full blur-2xl" />

      <div className="container px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* REALIS character - Hidden on mobile */}
          <ScrollReveal direction="left" className="hidden lg:block">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-gold/10 to-transparent rounded-full blur-3xl scale-75" />
              <img 
                src={realisGuiding}
                alt="REALIS guiando você para o próximo passo"
                className="relative z-10 w-full max-w-[380px] drop-shadow-2xl"
                loading="lazy"
              />
            </div>
          </ScrollReveal>

          {/* CTA Content */}
          <div className="text-center lg:text-left">
            <ScrollReveal>
              <span className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-gold/30 to-accent/20 text-gold font-semibold text-xs md:text-sm rounded-full mb-4 md:mb-6 border border-gold/30">
                <Crown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Acesso Premium Exclusivo
              </span>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 md:mb-6 leading-tight">
                Entre para a{' '}
                <span className="text-gradient-gold">Comunidade IA Real</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="text-base md:text-xl text-primary-foreground/80 mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0">
                Não é só um curso. É uma <strong className="text-gold">comunidade exclusiva</strong> onde você aprende e cresce junto com outros empreendedores.
              </p>
            </ScrollReveal>

            {/* Premium Features Box */}
            <ScrollReveal delay={250}>
              <div className="bg-gradient-to-br from-gold/10 via-accent/5 to-transparent border border-gold/20 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 backdrop-blur-sm">
                <h3 className="text-gold font-semibold mb-3 md:mb-4 flex items-center justify-center lg:justify-start gap-2 text-sm md:text-base">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                  Benefícios Exclusivos
                </h3>
                <div className="grid gap-2 md:gap-3">
                  {premiumFeatures.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 md:gap-3 text-primary-foreground/90"
                    >
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gold/20 flex items-center justify-center">
                        <feature.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gold" />
                      </div>
                      <span className="font-medium text-sm md:text-base">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="flex flex-col items-center lg:items-start gap-4 md:gap-6 mb-6 md:mb-10">
                <Button asChild variant="hero" size="lg" className="group text-base md:text-lg w-full sm:w-auto py-4 md:py-5">
                  <a href="https://payfast.greenn.com.br/152833" target="_blank" rel="noopener noreferrer">
                    Quero Acesso à Comunidade
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                <p className="text-primary-foreground/50 text-xs md:text-sm">
                  Acesso imediato após a confirmação do pagamento
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6 pt-6 md:pt-8 border-t border-primary-foreground/10">
                {guarantees.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1.5 md:gap-2 text-primary-foreground/70"
                  >
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                    <span className="text-xs md:text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
