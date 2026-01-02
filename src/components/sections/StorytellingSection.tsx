import { ScrollReveal } from '@/components/ScrollReveal';
import { Play, ArrowDown } from 'lucide-react';

const journey = [
  {
    step: 1,
    title: "Você tem uma ideia",
    description: "Pode ser um texto, um projeto, uma dúvida. Qualquer coisa.",
    visual: "💡"
  },
  {
    step: 2,
    title: "Você abre a ferramenta",
    description: "ChatGPT, Lovable, ou qualquer outra IA que você aprendeu a usar.",
    visual: "🖥️"
  },
  {
    step: 3,
    title: "Você aplica o método",
    description: "Com prompts estruturados, você pede exatamente o que precisa.",
    visual: "⚡"
  },
  {
    step: 4,
    title: "Você ajusta e refina",
    description: "Não ficou bom? Você sabe como melhorar. Iteração após iteração.",
    visual: "🔄"
  },
  {
    step: 5,
    title: "Você entrega o resultado",
    description: "Em minutos, você tem algo que antes levaria horas ou dias.",
    visual: "✅"
  }
];

export const StorytellingSection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary relative">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
              <Play className="w-4 h-4" />
              Jornada Real
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Como o método funciona{' '}
              <span className="text-gradient-gold">na prática</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Do problema à solução. Da ideia ao resultado. Você no controle.
            </p>
          </div>
        </ScrollReveal>

        {/* Journey timeline */}
        <div className="max-w-2xl mx-auto">
          {journey.map((item, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="relative pl-16 pb-12 last:pb-0">
                {/* Vertical line */}
                {index < journey.length - 1 && (
                  <div className="absolute left-6 top-14 w-0.5 h-[calc(100%-2rem)] bg-gradient-to-b from-accent to-transparent" />
                )}
                
                {/* Step number */}
                <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center">
                  <span className="text-2xl">{item.visual}</span>
                </div>
                
                {/* Arrow down (except last) */}
                {index < journey.length - 1 && (
                  <div className="absolute left-[18px] bottom-0">
                    <ArrowDown className="w-5 h-5 text-accent/50" />
                  </div>
                )}
                
                {/* Content */}
                <div className="bg-card rounded-2xl p-6 border border-border/50 hover:border-accent/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-accent">PASSO {item.step}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Final message */}
        <ScrollReveal delay={500}>
          <div className="mt-16 text-center">
            <div className="inline-block bg-navy rounded-2xl p-8 md:p-10">
              <p className="font-display text-xl md:text-2xl font-bold text-primary-foreground mb-4">
                Isso é IA aplicada.{' '}
                <span className="text-gradient-gold">Isso é o Método IA Real.</span>
              </p>
              <p className="text-primary-foreground/60 text-sm">
                Sem teoria vazia. Sem promessas. Só resultado.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
