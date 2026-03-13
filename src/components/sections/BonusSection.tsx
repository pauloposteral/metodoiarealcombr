import { ScrollReveal } from '@/components/ScrollReveal';
import { Gift, BookOpen, GraduationCap, RefreshCw } from 'lucide-react';

export const BonusSection = () => {
  const bonuses = [
    { icon: BookOpen, title: 'Biblioteca de Prompts', value: 'R$ 197', description: '100+ prompts testados' },
    { icon: RefreshCw, title: 'Atualizações Futuras', value: 'R$ 297', description: 'Acesso vitalício' },
    { icon: GraduationCap, title: 'Como Estudar com IA', value: 'R$ 97', description: 'Aula especial bônus' },
    { icon: Gift, title: 'Como Ensinar com IA', value: 'R$ 97', description: 'Para professores e instrutores' },
  ];

  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-4">
              <Gift className="w-4 h-4" />
              Bônus Exclusivos
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Você também recebe{' '}
              <span className="text-gradient-gold">de graça</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
          {bonuses.map((bonus, index) => (
            <ScrollReveal key={index} delay={index * 80}>
              <div className="relative bg-card border-2 border-accent/20 rounded-xl p-4 h-full hover:border-accent/40 transition-colors">
                <div className="absolute -top-2 -right-2">
                  <span className="inline-block bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">GRÁTIS</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <bonus.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display font-bold text-sm text-foreground mb-1">{bonus.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{bonus.description}</p>
                <p className="text-[10px] font-semibold text-accent line-through opacity-70">{bonus.value}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
