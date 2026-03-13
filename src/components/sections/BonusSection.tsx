import { ScrollReveal } from '@/components/ScrollReveal';
import { Gift, BookOpen, GraduationCap, RefreshCw } from 'lucide-react';

export const BonusSection = () => {
  const bonuses = [
    {
      icon: BookOpen,
      title: 'Biblioteca de Prompts Prontos',
      description: 'Mais de 100 prompts testados e otimizados para você usar imediatamente.',
      value: 'Valor: R$ 197',
    },
    {
      icon: RefreshCw,
      title: 'Atualizações Futuras',
      description: 'Acesso vitalício a todas as atualizações e novos conteúdos.',
      value: 'Valor: R$ 297',
    },
    {
      icon: GraduationCap,
      title: 'Como Estudar com IA',
      description: 'Aula especial sobre como usar IA para aprender qualquer coisa mais rápido.',
      value: 'Valor: R$ 97',
    },
    {
      icon: Gift,
      title: 'Como Ensinar com IA',
      description: 'Aula bônus para professores e instrutores que querem usar IA.',
      value: 'Valor: R$ 97',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
              <Gift className="w-4 h-4" />
              Bônus Exclusivos
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Você também vai receber{' '}
              <span className="text-gradient-gold">de graça</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Materiais exclusivos que vão acelerar ainda mais seus resultados.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bonuses.map((bonus, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-gold-light/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-card border-2 border-accent/20 rounded-2xl p-6 h-full hover:border-accent/40 transition-colors">
                  <div className="absolute -top-3 -right-3">
                    <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                      GRÁTIS
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                    <bonus.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {bonus.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {bonus.description}
                  </p>
                  <p className="text-xs font-semibold text-accent line-through opacity-70">
                    {bonus.value}
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
