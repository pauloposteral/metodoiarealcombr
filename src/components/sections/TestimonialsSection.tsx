import { ScrollReveal } from '@/components/ScrollReveal';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Marina Costa",
    role: "Empreendedora Digital",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    text: "Eu achava que IA era coisa de programador. Hoje uso todo dia pra criar posts, responder clientes e montar propostas. Economizo 10h por semana.",
    stars: 5
  },
  {
    name: "Ricardo Almeida",
    role: "Criador de Conteúdo",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    text: "Direto ao ponto. Na primeira semana já estava usando o ChatGPT do jeito certo. Mudou meu jogo.",
    stars: 5
  },
  {
    name: "Fernanda Lima",
    role: "Advogada",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    text: "O módulo de prompts é ouro puro. Uso pra revisar contratos e criar petições. Finalmente entendi como usar IA sem parecer robô.",
    stars: 5
  },
  {
    name: "Ana Beatriz",
    role: "Designer Freelancer",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    text: "Dobrei minha produtividade. Uso IA pra criar briefings, revisar textos e ter ideias novas. A biblioteca de prompts é demais.",
    stars: 5
  },
];

// Storytelling integrado
const storyCard = {
  name: "Ana, 34 anos",
  subtitle: "Empreendedora",
  journey: "Tinha medo de tecnologia. Não sabia nem o que era \"prompt\". Em 2 semanas, já usava IA para criar posts, responder clientes e montar propostas — economizando 10h por semana.",
};

export const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="py-10 md:py-16 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden scroll-mt-12 md:scroll-mt-16">
      <div className="container px-4 md:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-6 md:mb-8">
            <span className="inline-block px-3 py-1.5 bg-gold/10 text-gold rounded-full text-xs md:text-sm font-medium mb-3">
              Quem já está usando
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3 leading-tight">
              Gente como você,{' '}
              <span className="text-gradient-gold">usando IA de verdade</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Storytelling card */}
        <ScrollReveal delay={50}>
          <div className="max-w-2xl mx-auto mb-6 bg-gradient-to-r from-gold/10 via-accent/5 to-gold/10 border border-gold/20 rounded-xl p-5">
            <p className="text-xs text-gold font-semibold mb-2">📖 História real</p>
            <p className="text-sm text-foreground font-medium mb-1">{storyCard.name} — {storyCard.subtitle}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{storyCard.journey}</p>
          </div>
        </ScrollReveal>

        {/* Testimonials grid - 4 instead of 6 */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {testimonials.map((t, index) => (
            <ScrollReveal key={index} delay={index * 60}>
              <div className="bg-card border border-border/50 rounded-xl p-4 md:p-5 hover:border-gold/30 transition-all h-full flex flex-col">
                <Quote className="w-6 h-6 text-gold/30 mb-2" />
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <img src={t.image} alt={t.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-gold/20" loading="lazy" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Trust indicators */}
        <ScrollReveal delay={300}>
          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 md:gap-10">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gold">+2.500</p>
              <p className="text-xs text-muted-foreground">Alunos</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gold">4.9/5</p>
              <p className="text-xs text-muted-foreground">Avaliação</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gold">98%</p>
              <p className="text-xs text-muted-foreground">Aprovação</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
