import { ScrollReveal } from '@/components/ScrollReveal';
import { Check } from 'lucide-react';
import realisThinking from '@/assets/character/realis-thinking.png';

export const DifferentialsSection = () => {
  const differentials = [
    {
      title: 'Método claro e estruturado',
      description: 'Sequência lógica que te leva do zero ao avançado.',
    },
    {
      title: 'Linguagem simples',
      description: 'Sem termos técnicos desnecessários.',
    },
    {
      title: 'Aulas objetivas',
      description: 'Direto ao ponto, sem enrolação.',
    },
    {
      title: 'Aplicação imediata',
      description: 'Use o que aprendeu no mesmo dia.',
    },
    {
      title: 'Atualizações futuras incluídas',
      description: 'Conteúdo sempre atualizado com as novidades.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div className="container">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 items-center">
          {/* REALIS thinking */}
          <ScrollReveal direction="left" className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent rounded-full blur-2xl" />
              <img 
                src={realisThinking}
                alt="REALIS pensando sobre os diferenciais"
                className="relative z-10 w-full max-w-[300px] mx-auto drop-shadow-xl"
              />
            </div>
          </ScrollReveal>

          {/* Text content */}
          <ScrollReveal direction="up">
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
                Diferenciais
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Por que o Método IA Real é{' '}
                <span className="text-gradient-gold">diferente</span>?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Não é apenas mais um curso sobre IA. É um método pensado para pessoas que 
                querem resultados reais, sem complicação.
              </p>
            </div>
          </ScrollReveal>

          {/* Differentials list */}
          <ScrollReveal direction="right">
            <div className="space-y-4">
              {differentials.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-5 bg-card rounded-xl shadow-elegant hover-lift"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
