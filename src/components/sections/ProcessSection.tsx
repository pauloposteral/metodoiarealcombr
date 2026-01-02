import { ScrollReveal } from '@/components/ScrollReveal';
import { ArrowRight, Lightbulb, Pencil, RefreshCw, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: Lightbulb,
    phase: "01",
    title: "Ideia",
    description: "Você tem uma ideia ou necessidade",
    example: "\"Preciso criar um texto de vendas\"",
    color: "text-yellow-400"
  },
  {
    icon: Pencil,
    phase: "02",
    title: "Execução",
    description: "Você usa a IA com o método certo",
    example: "Prompt estruturado → resultado inicial",
    color: "text-accent"
  },
  {
    icon: RefreshCw,
    phase: "03",
    title: "Ajuste",
    description: "Você refina até ficar perfeito",
    example: "\"Melhore o tom, seja mais direto\"",
    color: "text-gold"
  },
  {
    icon: CheckCircle2,
    phase: "04",
    title: "Resultado",
    description: "Você tem o resultado final",
    example: "Texto pronto para usar",
    color: "text-green-400"
  }
];

const beforeAfter = {
  before: {
    label: "Antes",
    text: "A inteligência artificial é uma tecnologia que permite que máquinas executem tarefas que normalmente requerem inteligência humana, como reconhecimento de padrões e tomada de decisões."
  },
  after: {
    label: "Depois",
    text: "IA é como ter um assistente que nunca dorme. Você pede, ele entrega. Simples assim."
  }
};

export const ProcessSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
              <RefreshCw className="w-4 h-4" />
              O Processo Real
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              IA em uso no{' '}
              <span className="text-gradient-gold">mundo real</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Você vê o processo. Não só o resultado final.
            </p>
          </div>
        </ScrollReveal>

        {/* Process steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {steps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="relative group">
                {/* Arrow connector (hide on last) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10">
                    <ArrowRight className="w-6 h-6 text-border" />
                  </div>
                )}
                
                <div className="bg-card rounded-2xl p-6 h-full border border-border/50 hover:border-accent/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${step.color}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{step.phase}</span>
                  </div>
                  
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  <p className="text-xs text-accent italic">
                    {step.example}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Before/After comparison */}
        <ScrollReveal delay={200}>
          <div className="max-w-4xl mx-auto">
            <h3 className="font-display font-bold text-xl text-center text-foreground mb-8">
              Veja a diferença na prática
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="relative">
                <div className="absolute -top-3 left-4">
                  <span className="px-3 py-1 bg-destructive/20 text-destructive text-xs font-bold rounded-full">
                    {beforeAfter.before.label}
                  </span>
                </div>
                <div className="bg-card border border-destructive/20 rounded-2xl p-6 pt-8 h-full">
                  <p className="text-muted-foreground text-sm leading-relaxed italic">
                    "{beforeAfter.before.text}"
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-destructive">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
                    Genérico e confuso
                  </div>
                </div>
              </div>
              
              {/* After */}
              <div className="relative">
                <div className="absolute -top-3 left-4">
                  <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs font-bold rounded-full">
                    {beforeAfter.after.label}
                  </span>
                </div>
                <div className="bg-card border border-green-500/20 rounded-2xl p-6 pt-8 h-full">
                  <p className="text-foreground text-sm leading-relaxed font-medium">
                    "{beforeAfter.after.text}"
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-green-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Claro, direto e humano
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
