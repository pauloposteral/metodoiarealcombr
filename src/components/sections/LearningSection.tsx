import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  BookOpen, 
  Wrench, 
  MessageSquare, 
  FileText, 
  BarChart, 
  Rocket, 
  DollarSign, 
  Brain 
} from 'lucide-react';

export const LearningSection = () => {
  const learnings = [
    {
      icon: BookOpen,
      title: 'Fundamentos sem tecnicismo',
      description: 'Entenda IA de verdade, sem complicação.',
    },
    {
      icon: Wrench,
      title: 'Ferramentas essenciais',
      description: 'As melhores ferramentas para começar.',
    },
    {
      icon: MessageSquare,
      title: 'Prompts que funcionam',
      description: 'Técnicas para obter respostas melhores.',
    },
    {
      icon: FileText,
      title: 'IA para conteúdo',
      description: 'Crie textos, imagens e vídeos com IA.',
    },
    {
      icon: BarChart,
      title: 'IA para negócios',
      description: 'Aplique IA para vender e crescer.',
    },
    {
      icon: Rocket,
      title: 'IA para produtividade',
      description: 'Automatize e ganhe horas por semana.',
    },
    {
      icon: DollarSign,
      title: 'IA para renda extra',
      description: 'Monetize suas habilidades com IA.',
    },
    {
      icon: Brain,
      title: 'Mentalidade de longo prazo',
      description: 'Prepare-se para o futuro da IA.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
              O Que Você Vai Aprender
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Conhecimento prático e{' '}
              <span className="text-gradient-gold">aplicável</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Tudo que você precisa saber para usar IA no seu dia a dia.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {learnings.map((item, index) => (
            <ScrollReveal key={index} delay={index * 60}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-card border border-border rounded-2xl p-6 h-full hover:border-accent/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
