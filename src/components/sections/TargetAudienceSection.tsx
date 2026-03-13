import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  Sparkles, 
  Palette, 
  Briefcase, 
  User, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

export const TargetAudienceSection = () => {
  const audiences = [
    {
      icon: Sparkles,
      title: 'Iniciantes em IA',
      description: 'Nunca usou IA e quer começar do jeito certo.',
    },
    {
      icon: Palette,
      title: 'Criadores de conteúdo',
      description: 'Quer produzir mais e melhor com ajuda da IA.',
    },
    {
      icon: Briefcase,
      title: 'Empreendedores',
      description: 'Busca otimizar processos e escalar resultados.',
    },
    {
      icon: User,
      title: 'Profissionais liberais',
      description: 'Quer se diferenciar no mercado com IA.',
    },
    {
      icon: Clock,
      title: 'Quem quer ganhar tempo',
      description: 'Precisa automatizar tarefas repetitivas.',
    },
    {
      icon: TrendingUp,
      title: 'Quem quer se manter relevante',
      description: 'Entende que IA é o futuro do trabalho.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-6">
              Para Quem É
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Este método foi criado para{' '}
              <span className="text-gradient-gold">você</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {audiences.map((audience, index) => (
            <ScrollReveal key={index} delay={index * 80}>
              <div className="bg-card rounded-2xl p-6 h-full shadow-elegant hover-lift group">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                  <audience.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {audience.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {audience.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-accent/10 rounded-full px-6 py-3">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-foreground font-medium">
                Não é necessário conhecimento técnico.
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
