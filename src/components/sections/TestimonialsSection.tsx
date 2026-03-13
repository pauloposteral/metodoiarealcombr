import { ScrollReveal } from '@/components/ScrollReveal';
import { Star, Quote } from 'lucide-react';
import realisConfident from '@/assets/character/realis-confident.png';

const testimonials = [
  {
    name: "Marina Costa",
    role: "Empreendedora Digital",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    text: "Eu achava que IA era coisa de programador. Hoje uso todo dia pra criar posts, responder clientes e até montar propostas. Economizo umas 10 horas por semana.",
    stars: 5
  },
  {
    name: "Ricardo Almeida",
    role: "Criador de Conteúdo",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    text: "O curso é direto ao ponto. Nada de enrolação. Na primeira semana já estava usando o ChatGPT do jeito certo. Mudou meu jogo.",
    stars: 5
  },
  {
    name: "Fernanda Lima",
    role: "Advogada",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    text: "Finalmente entendi como usar IA sem parecer robô. O módulo de prompts é ouro puro. Uso pra revisar contratos e criar petições.",
    stars: 5
  },
  {
    name: "Carlos Eduardo",
    role: "Professor Universitário",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    text: "Recomendo pra todo mundo. O método é claro, progressivo, e funciona. Meus alunos já estão usando também.",
    stars: 5
  },
  {
    name: "Ana Beatriz",
    role: "Designer Freelancer",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    text: "Dobrei minha produtividade. Uso IA pra criar briefings, revisar textos e até ter ideias novas. A biblioteca de prompts é demais.",
    stars: 5
  },
  {
    name: "Pedro Henrique",
    role: "Consultor de Negócios",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    text: "Investimento que se paga na primeira semana. Uso IA pra analisar dados, criar apresentações e montar propostas muito mais rápido.",
    stars: 5
  }
];

export const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="py-12 md:py-20 lg:py-28 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden scroll-mt-12 md:scroll-mt-16">
      {/* Background decoration - Smaller on mobile */}
      <div className="absolute top-0 left-0 w-48 md:w-96 h-48 md:h-96 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-navy-light/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          {/* Header and REALIS */}
          <div className="lg:sticky lg:top-24">
            <ScrollReveal>
              <div className="text-center lg:text-left mb-6 md:mb-8">
                <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-gold/10 text-gold rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
                  Quem já está usando
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3 md:mb-4 leading-tight">
                  Gente como você,{' '}
                  <span className="text-gradient-gold">usando IA de verdade</span>
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Não são influencers. São profissionais comuns que aprenderam e aplicaram.
                </p>
              </div>
            </ScrollReveal>

            {/* REALIS confident - Hidden on mobile */}
            <ScrollReveal delay={200} direction="left" className="hidden lg:block">
              <div className="relative flex justify-center mt-8">
                <div className="absolute inset-0 bg-gradient-to-t from-gold/10 via-accent/5 to-transparent rounded-full blur-3xl scale-90" />
                <img 
                  src={realisConfident}
                  alt="REALIS confiante com os resultados"
                  className="relative z-10 w-full max-w-[280px] drop-shadow-2xl animate-character-entrance animate-character-glow"
                  loading="lazy"
                />
                {/* Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30">
                  <span className="text-accent font-display font-bold text-xs tracking-wider">REALIS</span>
                  <span className="text-muted-foreground text-xs ml-2">orgulhoso</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Testimonials grid */}
          <div className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              {testimonials.map((testimonial, index) => (
                <ScrollReveal key={index} delay={index * 60}>
                  <div className="group bg-card border border-border/50 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gold/30 hover:shadow-elegant transition-all duration-300 h-full flex flex-col">
                    {/* Quote icon */}
                    <Quote className="w-6 h-6 md:w-8 md:h-8 text-gold/30 mb-3 md:mb-4" />
                    
                    {/* Stars */}
                    <div className="flex gap-0.5 md:gap-1 mb-3 md:mb-4">
                      {Array.from({ length: testimonial.stars }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-gold text-gold" />
                      ))}
                    </div>
                    
                    {/* Text */}
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6 flex-grow">
                      "{testimonial.text}"
                    </p>
                    
                    {/* Author */}
                    <div className="flex items-center gap-3 md:gap-4 pt-3 md:pt-4 border-t border-border/50">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-gold/20"
                        loading="lazy"
                      />
                      <div>
                        <p className="font-semibold text-foreground text-sm md:text-base">{testimonial.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Trust indicators */}
            <ScrollReveal delay={400}>
              <div className="mt-8 md:mt-12 flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gold">+2.500</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Alunos satisfeitos</p>
                </div>
                <div className="w-px h-10 md:h-12 bg-border hidden sm:block" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gold">4.9/5</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Avaliação média</p>
                </div>
                <div className="w-px h-10 md:h-12 bg-border hidden sm:block" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gold">98%</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Taxa de aprovação</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
