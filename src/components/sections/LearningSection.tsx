import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  MessageSquare, FileText, Video, Lightbulb, LayoutGrid, Zap, Briefcase, Sparkles,
  MapPin, Trophy, Flag
} from 'lucide-react';

const categories = [
  { icon: MessageSquare, label: "Prompts", color: "bg-accent/10 text-accent" },
  { icon: FileText, label: "Textos", color: "bg-gold/10 text-gold" },
  { icon: Video, label: "Vídeos", color: "bg-navy-light/10 text-navy-light" },
  { icon: Lightbulb, label: "Ideias", color: "bg-yellow-500/10 text-yellow-500" },
  { icon: LayoutGrid, label: "Organização", color: "bg-blue-500/10 text-blue-500" },
  { icon: Zap, label: "Produtividade", color: "bg-green-500/10 text-green-500" },
  { icon: Briefcase, label: "Negócios", color: "bg-purple-500/10 text-purple-500" },
  { icon: Sparkles, label: "Criatividade", color: "bg-pink-500/10 text-pink-500" },
];

export const LearningSection = () => {
  return (
    <section className="py-10 md:py-16 bg-secondary relative overflow-hidden">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold font-semibold text-sm rounded-full mb-4">
              <Flag className="w-4 h-4" />
              Sua Jornada
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Do zero ao{' '}
              <span className="text-gradient-gold">domínio prático</span>
            </h2>
            <p className="text-base text-muted-foreground">
              Habilidades práticas que você usa todo dia.
            </p>
          </div>
        </ScrollReveal>

        {/* Journey bar */}
        <ScrollReveal delay={50}>
          <div className="max-w-2xl mx-auto mb-8 flex items-center gap-3 bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-medium">Curioso, mas confuso</span>
            </div>
            <div className="flex-1 h-1.5 bg-gradient-to-r from-muted-foreground/20 via-accent/40 to-green-500/40 rounded-full" />
            <div className="flex items-center gap-2 text-green-500">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-medium">Confiante e produtivo</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Skills grid */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 max-w-3xl mx-auto">
          {categories.map((cat, index) => (
            <ScrollReveal key={index} delay={index * 40}>
              <div className={`group p-3 rounded-xl ${cat.color} border border-current/10 text-center transition-all hover:scale-105 cursor-default`}>
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
                  <cat.icon className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-[11px] text-foreground">{cat.label}</h3>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Cada categoria tem <span className="text-foreground font-medium">aulas práticas</span> com{' '}
            <span className="text-accent font-medium">exemplos reais</span>.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
