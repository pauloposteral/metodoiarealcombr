import { ScrollReveal } from '@/components/ScrollReveal';
import { MousePointer, Sparkles, Wand2 } from 'lucide-react';

const screenshots = [
  {
    tool: "ChatGPT",
    caption: "Criando textos em tempo real",
    description: "Veja como usamos IA para transformar uma ideia simples em um texto completo",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    highlight: "Prompt aplicado na prática"
  },
  {
    tool: "Lovable",
    caption: "Construindo páginas do zero",
    description: "Página criada com comandos simples, sem código",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    highlight: "IA criando interface"
  },
  {
    tool: "Ferramentas de IA",
    caption: "Editando e refinando conteúdo",
    description: "Ajustando resultados até ficar perfeito",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    highlight: "Processo real de criação"
  }
];

export const RealProofSection = () => {
  return (
    <section className="py-20 md:py-28 bg-navy relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent font-semibold text-sm rounded-full mb-6">
              <MousePointer className="w-4 h-4" />
              Bastidores Reais
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Isso é{' '}
              <span className="text-gradient-gold">IA de verdade</span>
            </h2>
            <p className="text-lg text-primary-foreground/70 leading-relaxed">
              Não é teoria. Não é promessa. É o que a gente faz todo dia.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {screenshots.map((item, index) => (
            <ScrollReveal key={index} delay={index * 150}>
              <div className="group relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-gold/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-navy-light rounded-2xl overflow-hidden border border-primary-foreground/10">
                  {/* Tool badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy/90 backdrop-blur-sm text-accent text-xs font-medium rounded-full border border-accent/20">
                      <Sparkles className="w-3 h-3" />
                      {item.tool}
                    </span>
                  </div>
                  
                  {/* Screenshot */}
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={item.image}
                      alt={item.caption}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-gold text-xs font-medium mb-2">
                      <Wand2 className="w-3.5 h-3.5" />
                      {item.highlight}
                    </div>
                    <h3 className="font-display font-bold text-lg text-primary-foreground mb-2">
                      {item.caption}
                    </h3>
                    <p className="text-sm text-primary-foreground/60">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom message */}
        <ScrollReveal delay={400}>
          <div className="mt-16 text-center">
            <p className="inline-flex items-center gap-3 px-6 py-3 bg-primary-foreground/5 rounded-full text-primary-foreground/80 text-sm">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Tudo isso você aprende a fazer no curso
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
