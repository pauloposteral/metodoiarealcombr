import { ScrollReveal } from '@/components/ScrollReveal';
import { Target, Layers, Zap } from 'lucide-react';

export const SolutionSection = () => {
  const pillars = [
    {
      icon: Layers,
      title: 'Estruturado',
      description: 'Sequência lógica e progressiva de aprendizado.',
    },
    {
      icon: Target,
      title: 'Progressivo',
      description: 'Do básico ao avançado, no seu ritmo.',
    },
    {
      icon: Zap,
      title: 'Aplicável',
      description: 'Conhecimento que você usa imediatamente.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <ScrollReveal direction="left">
              <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
                A Solução
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                O Método{' '}
                <span className="text-gradient-gold">IA Real</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Um método estruturado, pensado para pessoas reais, que precisam de resultados 
                práticos. Aqui você não aprende apenas o que é IA — você aprende o que fazer com ela.
              </p>

              <div className="space-y-4">
                {pillars.map((pillar, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <pillar.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground mb-1">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right Content - Quote */}
          <ScrollReveal direction="right">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-gold-light/20 to-accent/20 rounded-3xl blur-2xl" />
              <div className="relative bg-navy rounded-3xl p-8 md:p-12">
                <div className="absolute top-6 left-6 text-accent/20 text-8xl font-serif">"</div>
                <p className="font-display text-xl md:text-2xl font-bold text-primary-foreground leading-relaxed relative z-10">
                  Você não aprende o que é IA.{' '}
                  <span className="text-gradient-gold">Você aprende o que fazer com ela.</span>
                </p>
                <div className="mt-8 pt-6 border-t border-primary-foreground/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-primary-foreground font-semibold text-sm">Método IA Real</p>
                      <p className="text-primary-foreground/60 text-xs">Aplicação prática</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
