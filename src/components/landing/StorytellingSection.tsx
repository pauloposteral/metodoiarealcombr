import { ScrollReveal } from '@/components/ScrollReveal';
import { Quote } from 'lucide-react';

export const StorytellingSection = () => {
  return (
    <section className="py-12 md:py-20 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl -translate-x-1/2" />

      <div className="container px-4 md:px-8 relative z-10">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-4">
                A jornada de uma aluna
              </span>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-10 relative">
              <Quote className="w-10 h-10 text-accent/20 absolute top-4 left-4" />
              
              <div className="space-y-4 text-foreground leading-relaxed relative z-10">
                <p className="text-sm md:text-base">
                  <strong className="text-accent">Ana tinha 42 anos</strong> e trabalhava como consultora de RH. 
                  Ouvia falar de IA todo dia, mas achava que era "coisa de programador". Tentou uns tutoriais 
                  no YouTube, mas ficou mais confusa.
                </p>
                <p className="text-sm md:text-base">
                  Quando encontrou o Método IA Real, <strong>em 3 dias já estava usando IA 
                  pra escrever descrições de vagas, criar roteiros de entrevista e montar relatórios</strong>. 
                  Coisas que antes levavam 4 horas, agora faz em 40 minutos.
                </p>
                <p className="text-sm md:text-base">
                  Hoje Ana é referência na empresa dela. O chefe pergunta: 
                  <em className="text-accent"> "Como você faz tudo tão rápido?"</em>. 
                  Ela só sorri. 😊
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
                  alt="Ana Paula"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/20"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">Ana Paula S.</p>
                  <p className="text-xs text-muted-foreground">Consultora de RH • Turma 12</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
