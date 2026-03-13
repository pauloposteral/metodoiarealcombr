import { ScrollReveal } from '@/components/ScrollReveal';
import { AlertCircle, Clock, Shuffle, HelpCircle } from 'lucide-react';

export const ProblemSection = () => {
  const problems = [
    {
      icon: Shuffle,
      title: 'Informação demais',
      description: 'Milhares de vídeos, tutoriais e dicas. Tudo ao mesmo tempo. E nada faz sentido junto.',
    },
    {
      icon: HelpCircle,
      title: 'Nenhum caminho claro',
      description: 'Você vê gente usando IA, mas não sabe por onde começar de verdade.',
    },
    {
      icon: AlertCircle,
      title: 'Linguagem de outro planeta',
      description: 'Tokens, embeddings, fine-tuning... parece que não foi feito pra você.',
    },
    {
      icon: Clock,
      title: 'Não sai do lugar',
      description: 'Você até tentou usar, mas não consegue aplicar no seu trabalho real.',
    },
  ];

  return (
    <section className="py-12 md:py-20 lg:py-28 bg-secondary">
      <div className="container px-4 md:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16">
            <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-accent/10 text-accent font-semibold text-xs md:text-sm rounded-full mb-4 md:mb-6">
              O Problema
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
              Você sabe que IA é importante. Mas{' '}
              <span className="text-gradient-gold">não sabe como usar.</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              E não é culpa sua. É que ninguém te mostrou do jeito certo.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-16">
          {problems.map((problem, index) => (
            <ScrollReveal key={index} delay={index * 80}>
              <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 h-full shadow-elegant hover-lift">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-destructive/10 flex items-center justify-center mb-3 md:mb-4">
                  <problem.icon className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
                </div>
                <h3 className="font-display font-bold text-base md:text-lg text-foreground mb-1.5 md:mb-2">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="bg-navy rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-center">
            <p className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground leading-relaxed">
              "IA não é complicada.{' '}
              <span className="text-gradient-gold">Complicado é aprender sem método.</span>"
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
