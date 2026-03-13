import { ScrollReveal } from '@/components/ScrollReveal';
import { Target, Layers, Zap } from 'lucide-react';

export const SolutionSection = () => {
  const pillars = [
    {
      icon: Layers,
      title: 'Passo a passo',
      description: 'Cada aula te leva pra próxima. Sem pular etapa.',
    },
    {
      icon: Target,
      title: 'No seu ritmo',
      description: 'Você assiste quando quiser. Volta quantas vezes precisar.',
    },
    {
      icon: Zap,
      title: 'Uso imediato',
      description: 'Terminou a aula? Já pode aplicar. Sem esperar.',
    },
  ];

  return (
    <section className="py-12 md:py-20 lg:py-28 bg-background">
      <div className="container px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <ScrollReveal direction="left">
              <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-accent/10 text-accent font-semibold text-xs md:text-sm rounded-full mb-4 md:mb-6">
                A Solução
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
                O{' '}
                <span className="text-gradient-gold">Método IA Real</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed">
                Nada de teoria infinita. Aqui você vê gente usando IA de verdade — e aprende 
                fazendo. Simples, direto, e aplicável hoje.
              </p>

              <div className="space-y-3 md:space-y-4">
                {pillars.map((pillar, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <pillar.icon className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground mb-0.5 md:mb-1 text-sm md:text-base">
                        {pillar.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
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
              <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-r from-accent/20 via-gold-light/20 to-accent/20 rounded-2xl md:rounded-3xl blur-xl md:blur-2xl" />
              <div className="relative bg-navy rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12">
                <div className="absolute top-4 md:top-6 left-4 md:left-6 text-accent/20 text-6xl md:text-8xl font-serif">"</div>
                <p className="font-display text-lg sm:text-xl md:text-2xl font-bold text-primary-foreground leading-relaxed relative z-10">
                  Menos explicação.{' '}
                  <span className="text-gradient-gold">Mais ação.</span>
                </p>
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-primary-foreground/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-primary-foreground font-semibold text-xs md:text-sm">Método IA Real</p>
                      <p className="text-primary-foreground/60 text-[10px] md:text-xs">Aplicação prática</p>
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
