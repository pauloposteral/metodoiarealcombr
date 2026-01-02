import { ScrollReveal } from '@/components/ScrollReveal';
import { Brain, PenTool, Target, Repeat } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: Brain,
    title: "Pensar melhor",
    description: "Antes de pedir qualquer coisa, você aprende a organizar suas ideias.",
    tip: "Clareza na entrada = qualidade na saída",
    color: "bg-gold/10 text-gold border-gold/20"
  },
  {
    number: "02",
    icon: PenTool,
    title: "Pedir certo",
    description: "Você descobre como estruturar prompts que a IA realmente entende.",
    tip: "A IA não lê pensamentos — lê instruções",
    color: "bg-accent/10 text-accent border-accent/20"
  },
  {
    number: "03",
    icon: Repeat,
    title: "Ajustar respostas",
    description: "Você aprende a refinar resultados até ficarem perfeitos.",
    tip: "Iteração é a chave: pedir → ver → melhorar",
    color: "bg-navy-light/10 text-navy-light border-navy-light/20"
  },
  {
    number: "04",
    icon: Target,
    title: "Aplicar no mundo real",
    description: "Você sabe exatamente como usar cada resultado no seu trabalho.",
    tip: "IA que não aplica é só entretenimento",
    color: "bg-green-500/10 text-green-500 border-green-500/20"
  }
];

export const StepByStepSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
              O Processo
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              4 passos para{' '}
              <span className="text-gradient-gold">dominar a IA</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Simples de entender. Fácil de aplicar. Impossível de esquecer.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className={`relative rounded-2xl p-6 border-2 ${step.color} h-full transition-all hover:scale-[1.02]`}>
                  {/* Number badge */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-card rounded-xl flex items-center justify-center border-2 border-current shadow-lg">
                    <span className="font-display font-bold text-sm">{step.number}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4 mt-2">
                    <step.icon className="w-6 h-6" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Tip */}
                  <div className="pt-4 border-t border-current/10">
                    <p className="text-xs italic opacity-80">
                      💡 {step.tip}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Visual summary */}
        <ScrollReveal delay={400}>
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-secondary rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">Resumo visual:</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 bg-gold/10 text-gold rounded-lg text-sm font-medium">Pensar</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm font-medium">Pedir</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-3 py-1.5 bg-navy-light/10 text-navy-light rounded-lg text-sm font-medium">Ajustar</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium">Aplicar</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
