import { ScrollReveal } from '@/components/ScrollReveal';
import { Sparkles, Palette, Briefcase, User, Clock, TrendingUp, Check, Zap, Monitor, Smartphone } from 'lucide-react';

export const TargetAudienceSection = () => {
  const audiences = [
    { icon: Sparkles, title: 'Iniciantes em IA', description: 'Nunca usou e quer começar certo.' },
    { icon: Palette, title: 'Criadores de conteúdo', description: 'Quer produzir mais com IA.' },
    { icon: Briefcase, title: 'Empreendedores', description: 'Quer otimizar e escalar.' },
    { icon: User, title: 'Profissionais liberais', description: 'Quer se diferenciar no mercado.' },
    { icon: Clock, title: 'Quem quer ganhar tempo', description: 'Automatizar tarefas repetitivas.' },
    { icon: TrendingUp, title: 'Quem quer se manter relevante', description: 'IA é o futuro do trabalho.' },
  ];

  const differentials = [
    { icon: Check, text: 'Método claro e estruturado' },
    { icon: Check, text: 'Linguagem simples' },
    { icon: Check, text: 'Aulas objetivas e diretas' },
    { icon: Check, text: 'Aplicação imediata' },
    { icon: Check, text: 'Atualizações futuras incluídas' },
  ];

  const howItWorks = [
    { icon: Zap, text: 'Acesso imediato' },
    { icon: Monitor, text: '100% online' },
    { icon: Clock, text: 'No seu ritmo' },
    { icon: Smartphone, text: 'Multi-dispositivo' },
  ];

  return (
    <section className="py-10 md:py-16 bg-secondary">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-4">
              Para Quem É
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Este método foi criado para{' '}
              <span className="text-gradient-gold">você</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {audiences.map((audience, index) => (
            <ScrollReveal key={index} delay={index * 60}>
              <div className="bg-card rounded-xl p-4 h-full shadow-elegant hover-lift group flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <audience.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground mb-0.5">{audience.title}</h3>
                  <p className="text-muted-foreground text-xs">{audience.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Differentials + How it works - Compact */}
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <ScrollReveal delay={100}>
            <div className="bg-card rounded-xl p-5 border border-border/50">
              <h3 className="font-display font-bold text-foreground mb-3 text-sm">Por que é diferente</h3>
              <div className="space-y-2">
                {differentials.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <d.icon className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{d.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="bg-card rounded-xl p-5 border border-border/50">
              <h3 className="font-display font-bold text-foreground mb-3 text-sm">Como funciona</h3>
              <div className="space-y-2">
                {howItWorks.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <h.icon className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{h.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
