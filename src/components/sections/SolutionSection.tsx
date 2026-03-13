import { ScrollReveal } from '@/components/ScrollReveal';
import { Target, Layers, Zap } from 'lucide-react';

export const SolutionSection = () => {
  const pillars = [
    { icon: Layers, title: 'Passo a passo', description: 'Cada aula te leva pra próxima. Sem pular etapa.' },
    { icon: Target, title: 'No seu ritmo', description: 'Assista quando quiser. Volta quantas vezes precisar.' },
    { icon: Zap, title: 'Uso imediato', description: 'Terminou a aula? Já pode aplicar.' },
  ];

  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          <div>
            <ScrollReveal direction="left">
              <span className="inline-block px-3 py-1.5 bg-accent/10 text-accent font-semibold text-xs md:text-sm rounded-full mb-4">
                A Solução
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
                O{' '}<span className="text-gradient-gold">Método IA Real</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-5 leading-relaxed">
                Nada de teoria infinita. Aqui você vê gente usando IA de verdade — e aprende fazendo.
              </p>
              <div className="space-y-3">
                {pillars.map((pillar, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <pillar.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-sm">{pillar.title}</h3>
                      <p className="text-xs text-muted-foreground">{pillar.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="right">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-accent/20 via-gold-light/20 to-accent/20 rounded-2xl blur-xl" />
              <div className="relative bg-navy rounded-2xl p-6 md:p-8">
                <div className="absolute top-4 left-4 text-accent/20 text-6xl font-serif">"</div>
                <p className="font-display text-lg md:text-xl font-bold text-primary-foreground leading-relaxed relative z-10">
                  Menos explicação.{' '}<span className="text-gradient-gold">Mais ação.</span>
                </p>
                <div className="mt-5 pt-4 border-t border-primary-foreground/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-primary-foreground font-semibold text-xs">Método IA Real</p>
                    <p className="text-primary-foreground/60 text-[10px]">Aplicação prática</p>
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
