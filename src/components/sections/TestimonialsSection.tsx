import { ScrollReveal } from '@/components/ScrollReveal';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Marina Costa",
    role: "Empreendedora Digital",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    text: "Eu achava que IA era coisa de programador. Com o Método IA Real, aprendi a usar no meu dia a dia de forma simples. Economizo horas toda semana!",
    stars: 5
  },
  {
    name: "Ricardo Almeida",
    role: "Criador de Conteúdo",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    text: "O curso é direto ao ponto. Sem enrolação, sem tecnicismo. Em uma semana já estava aplicando tudo no meu trabalho.",
    stars: 5
  },
  {
    name: "Fernanda Lima",
    role: "Advogada",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    text: "Finalmente um curso que explica IA de forma humana. O módulo de prompts mudou completamente a forma como uso o ChatGPT.",
    stars: 5
  },
  {
    name: "Carlos Eduardo",
    role: "Professor Universitário",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    text: "Recomendo para todos os meus alunos. O método é estruturado e progressivo. Ideal para quem quer começar do zero.",
    stars: 5
  },
  {
    name: "Ana Beatriz",
    role: "Designer Freelancer",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    text: "Dobrei minha produtividade usando as técnicas do curso. A biblioteca de prompts é um tesouro!",
    stars: 5
  },
  {
    name: "Pedro Henrique",
    role: "Consultor de Negócios",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    text: "Investimento que se paga em uma semana. Estou usando IA para analisar dados e criar propostas 10x mais rápido.",
    stars: 5
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-navy-light/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-medium mb-4">
              Provas Sociais
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              O que dizem nossos alunos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Histórias reais de pessoas que transformaram sua relação com a tecnologia
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="group bg-card border border-border/50 rounded-2xl p-6 lg:p-8 hover:border-gold/30 hover:shadow-elegant transition-all duration-300 h-full flex flex-col">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-gold/30 mb-4" />
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                
                {/* Text */}
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                  "{testimonial.text}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gold/20"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Trust indicators */}
        <ScrollReveal delay={0.4}>
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-gold">+2.500</p>
              <p className="text-sm text-muted-foreground">Alunos satisfeitos</p>
            </div>
            <div className="w-px h-12 bg-border hidden md:block" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-gold">4.9/5</p>
              <p className="text-sm text-muted-foreground">Avaliação média</p>
            </div>
            <div className="w-px h-12 bg-border hidden md:block" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-gold">98%</p>
              <p className="text-sm text-muted-foreground">Taxa de aprovação</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
