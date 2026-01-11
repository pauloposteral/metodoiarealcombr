import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  MessageSquare, 
  FileText, 
  Video, 
  Lightbulb, 
  LayoutGrid, 
  Zap, 
  Briefcase,
  Sparkles
} from 'lucide-react';
import realisTeaching from '@/assets/character/realis-teaching.png';

const iconCategories = [
  { icon: MessageSquare, label: "Prompts", description: "A arte de pedir certo", color: "bg-accent/10 text-accent" },
  { icon: FileText, label: "Textos", description: "Posts, e-mails, artigos", color: "bg-gold/10 text-gold" },
  { icon: Video, label: "Vídeos", description: "Roteiros e ideias", color: "bg-navy-light/10 text-navy-light" },
  { icon: Lightbulb, label: "Ideias", description: "Brainstorm turbinado", color: "bg-yellow-500/10 text-yellow-500" },
  { icon: LayoutGrid, label: "Organização", description: "Planejamento claro", color: "bg-blue-500/10 text-blue-500" },
  { icon: Zap, label: "Produtividade", description: "Fazer mais em menos tempo", color: "bg-green-500/10 text-green-500" },
  { icon: Briefcase, label: "Negócios", description: "Estratégia e vendas", color: "bg-purple-500/10 text-purple-500" },
  { icon: Sparkles, label: "Criatividade", description: "Conteúdo original", color: "bg-pink-500/10 text-pink-500" },
];

export const WhatYouLearnSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary relative overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div>
            <ScrollReveal>
              <div className="text-center lg:text-left mb-12">
                <span className="inline-block px-4 py-2 bg-gold/10 text-gold font-semibold text-sm rounded-full mb-6">
                  Conteúdo Prático
                </span>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  O que você vai{' '}
                  <span className="text-gradient-gold">saber fazer</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Não é só teoria. É habilidade prática que você usa todo dia.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {iconCategories.map((category, index) => (
                <ScrollReveal key={index} delay={index * 60}>
                  <div className={`group p-4 rounded-2xl ${category.color} border border-current/10 text-center transition-all hover:scale-105 cursor-default`}>
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <category.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-foreground mb-1">
                      {category.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Insight */}
            <ScrollReveal delay={400}>
              <div className="mt-8 text-center lg:text-left">
                <p className="text-muted-foreground text-sm">
                  Cada categoria tem <span className="text-foreground font-medium">aulas práticas</span> com{' '}
                  <span className="text-accent font-medium">exemplos reais</span> que você aplica imediatamente.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Right side - REALIS teaching */}
          <ScrollReveal direction="right" className="hidden lg:block">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-gold/10 via-accent/5 to-transparent rounded-full blur-3xl scale-75" />
              <img 
                src={realisTeaching}
                alt="REALIS ensinando o conteúdo prático"
                className="relative z-10 w-full max-w-[400px] drop-shadow-2xl"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
