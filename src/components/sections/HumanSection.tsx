import { ScrollReveal } from '@/components/ScrollReveal';

const realPeople = [
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
    caption: "Criando conteúdo com IA",
    context: "Café • São Paulo"
  },
  {
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80",
    caption: "Revisando textos gerados",
    context: "Home office"
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
    caption: "Equipe usando IA no dia a dia",
    context: "Escritório • Coworking"
  },
  {
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
    caption: "Ajustando prompts em tempo real",
    context: "Reunião de trabalho"
  },
  {
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
    caption: "Criando ideias para projetos",
    context: "Freelancer • Casa"
  },
  {
    image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&q=80",
    caption: "Aprendendo e aplicando",
    context: "Estudante • Biblioteca"
  }
];

export const HumanSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary relative overflow-hidden">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-gold/10 text-gold font-semibold text-sm rounded-full mb-6">
              Pessoas Reais
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Gente de verdade usando{' '}
              <span className="text-gradient-gold">IA de verdade</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Não é stock genérico. É o dia a dia de quem já aplica o método.
            </p>
          </div>
        </ScrollReveal>

        {/* Photo grid - Masonry style */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {realPeople.map((person, index) => (
            <ScrollReveal key={index} delay={index * 80}>
              <div 
                className={`group relative overflow-hidden rounded-2xl ${
                  index === 0 || index === 5 ? 'md:row-span-2 aspect-[3/4]' : 'aspect-[4/3]'
                }`}
              >
                <img 
                  src={person.image}
                  alt={person.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-primary-foreground font-medium text-sm mb-1">
                    {person.caption}
                  </p>
                  <p className="text-primary-foreground/60 text-xs">
                    {person.context}
                  </p>
                </div>
                
                {/* Always visible micro-caption on mobile */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-navy-dark/80 to-transparent md:hidden">
                  <p className="text-primary-foreground text-xs font-medium">
                    {person.caption}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Quote */}
        <ScrollReveal delay={400}>
          <div className="mt-16 text-center">
            <blockquote className="text-xl md:text-2xl font-display font-medium text-foreground italic max-w-2xl mx-auto">
              "A melhor forma de aprender IA é vendo pessoas reais usando. É isso que ensinamos."
            </blockquote>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
