import { ScrollReveal } from '@/components/ScrollReveal';
import { User, MessageSquare, Cpu, FileText, RefreshCw, ArrowRight, Brain, PenTool, Target, Repeat } from 'lucide-react';

const flowSteps = [
  { icon: User, label: "Você", sublabel: "com uma ideia", color: "bg-gold/20 text-gold" },
  { icon: MessageSquare, label: "Prompt", sublabel: "a pergunta certa", color: "bg-accent/20 text-accent" },
  { icon: Cpu, label: "IA", sublabel: "processa", color: "bg-navy-light/20 text-navy-light" },
  { icon: FileText, label: "Resultado", sublabel: "primeira versão", color: "bg-green-500/20 text-green-500" },
  { icon: RefreshCw, label: "Ajuste", sublabel: "você refina", color: "bg-gold/20 text-gold" },
];

const steps = [
  { number: "01", icon: Brain, title: "Pensar melhor", tip: "Clareza na entrada = qualidade na saída", color: "bg-gold/10 text-gold border-gold/20" },
  { number: "02", icon: PenTool, title: "Pedir certo", tip: "A IA não lê pensamentos — lê instruções", color: "bg-accent/10 text-accent border-accent/20" },
  { number: "03", icon: Repeat, title: "Ajustar respostas", tip: "Iteração é a chave: pedir → ver → melhorar", color: "bg-navy-light/10 text-navy-light border-navy-light/20" },
  { number: "04", icon: Target, title: "Aplicar no mundo real", tip: "IA que não aplica é só entretenimento", color: "bg-green-500/10 text-green-500 border-green-500/20" },
];

export const ProcessSection = () => {
  return (
    <section className="py-10 md:py-16 bg-background relative overflow-hidden">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-4">
              <Cpu className="w-4 h-4" />
              Como Funciona na Prática
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              O processo é{' '}
              <span className="text-gradient-gold">simples</span>
            </h2>
            <p className="text-base text-muted-foreground">
              Não é mágica. É um ciclo que você aprende a dominar.
            </p>
          </div>
        </ScrollReveal>

        {/* Flow Diagram - Compact */}
        <ScrollReveal delay={100}>
          <div className="max-w-4xl mx-auto mb-8 md:mb-10">
            <div className="bg-card rounded-2xl p-5 md:p-8 border border-border/50">
              <div className="hidden md:flex items-center justify-between gap-2">
                {flowSteps.map((step, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-2`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <p className="font-display font-bold text-foreground text-xs">{step.label}</p>
                      <p className="text-[10px] text-muted-foreground">{step.sublabel}</p>
                    </div>
                    {index < flowSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-accent mx-1 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <div className="md:hidden flex flex-wrap justify-center gap-3">
                {flowSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-lg ${step.color} flex items-center justify-center`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{step.label}</span>
                    {index < flowSteps.length - 1 && <ArrowRight className="w-3 h-3 text-accent/50" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 4 Steps Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {steps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 80}>
              <div className={`relative rounded-xl p-4 border-2 ${step.color} h-full`}>
                <div className="absolute -top-2 -left-2 w-7 h-7 bg-card rounded-lg flex items-center justify-center border-2 border-current shadow-sm">
                  <span className="font-display font-bold text-[10px]">{step.number}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center mb-2 mt-1">
                  <step.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-foreground mb-1">{step.title}</h3>
                <p className="text-[10px] italic opacity-80">💡 {step.tip}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
