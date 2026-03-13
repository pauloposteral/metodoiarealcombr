import { ScrollReveal } from '@/components/ScrollReveal';
import { AlertCircle, Clock, Shuffle, HelpCircle } from 'lucide-react';

export const ProblemSection = () => {
  const problems = [
    { icon: Shuffle, title: 'Informação demais', description: 'Milhares de vídeos e tutoriais. Nada faz sentido junto.' },
    { icon: HelpCircle, title: 'Sem caminho claro', description: 'Não sabe por onde começar de verdade.' },
    { icon: AlertCircle, title: 'Linguagem de outro planeta', description: 'Tokens, embeddings, fine-tuning... parece que não foi feito pra você.' },
    { icon: Clock, title: 'Não sai do lugar', description: 'Até tentou usar, mas não consegue aplicar.' },
  ];

  return (
    <section className="py-10 md:py-16 bg-secondary">
      <div className="container px-4 md:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-6 md:mb-8">
            <span className="inline-block px-3 py-1.5 bg-accent/10 text-accent font-semibold text-xs md:text-sm rounded-full mb-4">
              O Problema
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
              Você sabe que IA é importante. Mas{' '}
              <span className="text-gradient-gold">não sabe como usar.</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {problems.map((problem, index) => (
            <ScrollReveal key={index} delay={index * 60}>
              <div className="bg-card rounded-xl p-4 h-full shadow-elegant">
                <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center mb-3">
                  <problem.icon className="w-4 h-4 text-destructive" />
                </div>
                <h3 className="font-display font-bold text-sm text-foreground mb-1">{problem.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{problem.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="bg-navy rounded-xl p-5 md:p-6 text-center">
            <p className="font-display text-lg md:text-xl font-bold text-primary-foreground">
              "IA não é complicada.{' '}
              <span className="text-gradient-gold">Complicado é aprender sem método.</span>"
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
