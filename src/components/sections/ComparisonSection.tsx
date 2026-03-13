import { ScrollReveal } from '@/components/ScrollReveal';
import { X, Check, Shuffle, Target, HelpCircle, Lightbulb, Clock, Zap } from 'lucide-react';

const beforeItems = [
  { icon: Shuffle, text: "Tutoriais aleatórios" },
  { icon: HelpCircle, text: "Sem saber por onde começar" },
  { icon: Clock, text: "Horas perdidas testando" },
  { icon: X, text: "Resultados genéricos" },
];

const afterItems = [
  { icon: Target, text: "Caminho claro e estruturado" },
  { icon: Lightbulb, text: "Passo a passo didático" },
  { icon: Zap, text: "Aplicação imediata" },
  { icon: Check, text: "Resultados profissionais" },
];

export const ComparisonSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary relative overflow-hidden">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-gold/10 text-gold font-semibold text-sm rounded-full mb-6">
              A Diferença
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Com método vs.{' '}
              <span className="text-gradient-gold">sem método</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A ferramenta é a mesma. A diferença está em como você usa.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before Card */}
            <ScrollReveal delay={100}>
              <div className="relative h-full">
                <div className="absolute -top-3 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
                    <X className="w-3.5 h-3.5" />
                    SEM MÉTODO
                  </span>
                </div>
                <div className="bg-card border-2 border-destructive/20 rounded-2xl p-6 pt-10 h-full">
                  <div className="space-y-4">
                    {beforeItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-destructive/5 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-destructive" />
                        </div>
                        <p className="text-sm text-muted-foreground">{item.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50 text-center">
                    <p className="text-xs text-destructive font-medium">
                      Frustração e tempo perdido
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* After Card */}
            <ScrollReveal delay={200}>
              <div className="relative h-full">
                <div className="absolute -top-3 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full">
                    <Check className="w-3.5 h-3.5" />
                    COM MÉTODO
                  </span>
                </div>
                <div className="bg-card border-2 border-green-500/20 rounded-2xl p-6 pt-10 h-full shadow-elegant">
                  <div className="space-y-4">
                    {afterItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-500/5 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-sm text-foreground font-medium">{item.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-green-500/20 text-center">
                    <p className="text-xs text-green-500 font-medium">
                      Clareza e resultados reais
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Bottom insight */}
          <ScrollReveal delay={300}>
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-card border border-border/50 rounded-full">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  O método transforma a <span className="text-foreground font-medium">mesma ferramenta</span> em <span className="text-accent font-medium">resultados diferentes</span>
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
