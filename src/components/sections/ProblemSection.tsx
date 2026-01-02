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
    <section className="py-20 md:py-28 bg-secondary">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
              O Problema
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Você sabe que IA é importante. Mas{' '}
              <span className="text-gradient-gold">não sabe como usar.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              E não é culpa sua. É que ninguém te mostrou do jeito certo.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {problems.map((problem, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="bg-card rounded-2xl p-6 h-full shadow-elegant hover-lift">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
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
          <div className="bg-navy rounded-3xl p-8 md:p-12 text-center">
            <p className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground leading-relaxed">
              "IA não é complicada.{' '}
              <span className="text-gradient-gold">Complicado é aprender sem método.</span>"
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
