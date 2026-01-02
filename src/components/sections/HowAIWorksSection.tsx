import { ScrollReveal } from '@/components/ScrollReveal';
import { User, MessageSquare, Cpu, FileText, RefreshCw, ArrowRight } from 'lucide-react';

const flowSteps = [
  { icon: User, label: "Você", sublabel: "com uma ideia", color: "bg-gold/20 text-gold" },
  { icon: MessageSquare, label: "Prompt", sublabel: "a pergunta certa", color: "bg-accent/20 text-accent" },
  { icon: Cpu, label: "IA", sublabel: "processa", color: "bg-navy-light/20 text-navy-light" },
  { icon: FileText, label: "Resultado", sublabel: "primeira versão", color: "bg-green-500/20 text-green-500" },
  { icon: RefreshCw, label: "Ajuste", sublabel: "você refina", color: "bg-gold/20 text-gold" },
];

export const HowAIWorksSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
              <Cpu className="w-4 h-4" />
              Entenda de Verdade
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Como a IA funciona{' '}
              <span className="text-gradient-gold">na prática</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Não é mágica. É um processo simples que você aprende a dominar.
            </p>
          </div>
        </ScrollReveal>

        {/* Flow Diagram */}
        <ScrollReveal delay={100}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-3xl p-8 md:p-12 border border-border/50 shadow-elegant">
              {/* Desktop Flow */}
              <div className="hidden md:flex items-center justify-between gap-2">
                {flowSteps.map((step, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-3 transition-transform hover:scale-110`}>
                        <step.icon className="w-7 h-7" />
                      </div>
                      <p className="font-display font-bold text-foreground text-sm">{step.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{step.sublabel}</p>
                    </div>
                    {index < flowSteps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-accent mx-2 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Flow */}
              <div className="md:hidden space-y-4">
                {flowSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-foreground text-sm">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.sublabel}</p>
                    </div>
                    {index < flowSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-accent/50" />
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="mt-10 pt-8 border-t border-border/50">
                <p className="text-center text-muted-foreground text-sm max-w-2xl mx-auto">
                  <span className="text-foreground font-medium">É um ciclo.</span>{' '}
                  Você pede, a IA entrega, você ajusta. Em cada volta, o resultado melhora.
                  <span className="text-accent font-medium"> Isso é usar IA com método.</span>
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
