import { ScrollReveal } from '@/components/ScrollReveal';
import { Zap, Monitor, Clock, Smartphone } from 'lucide-react';

export const HowItWorksSection = () => {
  const features = [
    {
      icon: Zap,
      title: 'Acesso imediato',
      description: 'Comece a estudar assim que confirmar sua inscrição.',
    },
    {
      icon: Monitor,
      title: '100% online',
      description: 'Estude de qualquer lugar, a qualquer hora.',
    },
    {
      icon: Clock,
      title: 'No seu ritmo',
      description: 'Avance conforme sua disponibilidade.',
    },
    {
      icon: Smartphone,
      title: 'Multi-dispositivo',
      description: 'Compatível com celular, tablet e desktop.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
              Como Funciona
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Simples, prático e{' '}
              <span className="text-gradient-gold">acessível</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="text-center p-8 bg-card rounded-2xl shadow-elegant hover-lift">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
