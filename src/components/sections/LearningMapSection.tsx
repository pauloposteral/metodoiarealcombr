import { ScrollReveal } from '@/components/ScrollReveal';
import { MapPin, Flag, Sparkles, BookOpen, Wrench, Lightbulb, Trophy, Star } from 'lucide-react';

const milestones = [
  {
    position: "start",
    icon: MapPin,
    title: "Onde você está",
    description: "Curioso, mas confuso",
    items: ["Ouviu falar de IA", "Não sabe por onde começar", "Medo de ser complicado"],
    color: "border-muted-foreground/30 bg-muted/50",
    iconColor: "text-muted-foreground"
  },
  {
    position: "mid",
    icon: BookOpen,
    title: "Fundamentos",
    description: "Entendendo a base",
    items: ["O que é IA de verdade", "Como ela 'pensa'", "O que você pode fazer"],
    color: "border-accent/30 bg-accent/5",
    iconColor: "text-accent"
  },
  {
    position: "mid",
    icon: Wrench,
    title: "Ferramentas",
    description: "Dominando os recursos",
    items: ["ChatGPT na prática", "Outras IAs úteis", "Quando usar cada uma"],
    color: "border-gold/30 bg-gold/5",
    iconColor: "text-gold"
  },
  {
    position: "mid",
    icon: Lightbulb,
    title: "Prompts",
    description: "A arte de pedir",
    items: ["Estrutura de prompts", "Técnicas avançadas", "Biblioteca prática"],
    color: "border-accent/30 bg-accent/5",
    iconColor: "text-accent"
  },
  {
    position: "mid",
    icon: Sparkles,
    title: "Aplicação",
    description: "Usando no dia a dia",
    items: ["Textos e conteúdo", "Produtividade", "Negócios e vendas"],
    color: "border-gold/30 bg-gold/5",
    iconColor: "text-gold"
  },
  {
    position: "end",
    icon: Trophy,
    title: "Onde você chega",
    description: "Confiante e produtivo",
    items: ["Usa IA todo dia", "Resultados reais", "Autonomia total"],
    color: "border-green-500/30 bg-green-500/5",
    iconColor: "text-green-500"
  },
];

export const LearningMapSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      
      <div className="container relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
              <Flag className="w-4 h-4" />
              Sua Jornada
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              O mapa do{' '}
              <span className="text-gradient-gold">aprendizado</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Veja exatamente onde você está e para onde vai. Sem surpresas.
            </p>
          </div>
        </ScrollReveal>

        {/* Learning Path */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-muted-foreground/20 via-accent/40 to-green-500/40 rounded-full -translate-y-1/2" />
            
            {/* Milestones Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {milestones.map((milestone, index) => (
                <ScrollReveal key={index} delay={index * 80}>
                  <div className={`relative p-4 rounded-2xl border-2 ${milestone.color} h-full transition-all hover:scale-105`}>
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl bg-background flex items-center justify-center mb-3 mx-auto ${milestone.iconColor}`}>
                      <milestone.icon className="w-5 h-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="text-center">
                      <h3 className="font-display font-bold text-sm text-foreground mb-1">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {milestone.description}
                      </p>
                      
                      {/* Items */}
                      <ul className="space-y-1">
                        {milestone.items.map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                            <Star className="w-2.5 h-2.5 text-gold flex-shrink-0" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Position badge */}
                    {milestone.position === "start" && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <span className="px-2 py-0.5 bg-muted-foreground text-background text-[10px] font-bold rounded-full">
                          HOJE
                        </span>
                      </div>
                    )}
                    {milestone.position === "end" && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                          META
                        </span>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <ScrollReveal delay={400}>
          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              Cada etapa te leva pra próxima.{' '}
              <span className="text-accent font-medium">Sem pular, sem confusão.</span>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
