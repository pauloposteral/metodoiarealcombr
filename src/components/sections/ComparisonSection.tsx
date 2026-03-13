import { ScrollReveal } from '@/components/ScrollReveal';
import { X, Check, Shuffle, Target, HelpCircle, Lightbulb, Clock, Zap } from 'lucide-react';

const beforeItems = [
  { icon: Shuffle, text: "Tutoriais aleatórios", metric: "Horas perdidas" },
  { icon: HelpCircle, text: "Sem saber por onde começar", metric: "Frustração" },
  { icon: Clock, text: "2h para escrever um e-mail", metric: "Improdutivo" },
  { icon: X, text: "Resultados genéricos", metric: "Sem qualidade" },
];

const afterItems = [
  { icon: Target, text: "Caminho claro e estruturado", metric: "Foco total" },
  { icon: Lightbulb, text: "Passo a passo didático", metric: "Sem dúvidas" },
  { icon: Zap, text: "10 min para o mesmo e-mail", metric: "12x mais rápido" },
  { icon: Check, text: "Resultados profissionais", metric: "Alta qualidade" },
];

export const ComparisonSection = () => {
  return (
    <section className="py-10 md:py-16 bg-secondary relative overflow-hidden">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="inline-block px-4 py-2 bg-gold/10 text-gold font-semibold text-sm rounded-full mb-4">
              A Diferença
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Com método vs.{' '}
              <span className="text-gradient-gold">sem método</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
          <ScrollReveal delay={100}>
            <div className="relative h-full">
              <div className="absolute -top-3 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
                  <X className="w-3 h-3" /> SEM MÉTODO
                </span>
              </div>
              <div className="bg-card border-2 border-destructive/20 rounded-xl p-5 pt-8 h-full">
                <div className="space-y-3">
                  {beforeItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2.5 bg-destructive/5 rounded-lg">
                      <item.icon className="w-4 h-4 text-destructive flex-shrink-0" />
                      <span className="text-sm text-muted-foreground flex-1">{item.text}</span>
                      <span className="text-[10px] text-destructive/70 font-medium">{item.metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="relative h-full">
              <div className="absolute -top-3 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  <Check className="w-3 h-3" /> COM MÉTODO
                </span>
              </div>
              <div className="bg-card border-2 border-green-500/20 rounded-xl p-5 pt-8 h-full shadow-elegant">
                <div className="space-y-3">
                  {afterItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2.5 bg-green-500/5 rounded-lg">
                      <item.icon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground font-medium flex-1">{item.text}</span>
                      <span className="text-[10px] text-green-500 font-semibold">{item.metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
