import { ScrollReveal } from '@/components/ScrollReveal';
import { MessageSquare, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

const example = {
  context: "Você precisa criar um post para Instagram sobre seu negócio",
  badPrompt: "Crie um post para Instagram sobre minha loja de roupas",
  badResult: "A IA gera algo genérico e sem personalidade",
  goodPrompt: "Atue como um especialista em moda feminina. Crie um post de Instagram para uma loja focada em mulheres de 25-40 anos. Tom: descontraído e inspirador. Inclua: 1 gancho forte, 3 benefícios e 1 CTA. Máximo 150 palavras.",
  result: "✨ Sabe aquela sensação de se olhar no espelho e se sentir incrível?\n\nNa [Nome da Loja], cada peça foi escolhida pensando em você:\n\n→ Conforto o dia todo\n→ Estilo sem esforço\n→ Peças que combinam com tudo\n\nModa que valoriza quem você é. Simples assim.\n\n📍 Link na bio | Frete grátis acima de R$199",
};

export const PromptExampleSection = () => {
  return (
    <section className="py-10 md:py-16 bg-navy relative overflow-hidden">
      <div className="container relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent font-semibold text-sm rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              Exemplo Real
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3">
              Veja a diferença de{' '}
              <span className="text-gradient-gold">um bom prompt</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto space-y-4">
          {/* Bad prompt */}
          <ScrollReveal delay={100}>
            <div className="bg-navy-light/50 rounded-xl p-4 border border-primary-foreground/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-destructive text-xs font-bold">1</div>
                <span className="text-xs font-medium text-destructive">Prompt genérico</span>
              </div>
              <div className="bg-navy rounded-lg p-3 flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-primary-foreground/40 mt-0.5 flex-shrink-0" />
                <p className="text-primary-foreground/80 text-sm italic">"{example.badPrompt}"</p>
              </div>
              <p className="mt-2 text-xs text-destructive/80">⛔ {example.badResult}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-accent">
                <ArrowRight className="w-4 h-4 rotate-90" />
                <span className="text-xs font-medium">Aplicando o método...</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Good prompt */}
          <ScrollReveal delay={200}>
            <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">2</div>
                <span className="text-xs font-medium text-accent">Prompt estruturado</span>
              </div>
              <div className="bg-navy rounded-lg p-3 flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-primary-foreground text-sm">"{example.goodPrompt}"</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Result */}
          <ScrollReveal delay={300}>
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-xs font-bold">3</div>
                <span className="text-xs font-medium text-green-500">Resultado pronto</span>
                <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
              </div>
              <div className="bg-navy rounded-lg p-4">
                <p className="text-primary-foreground text-sm whitespace-pre-line leading-relaxed">{example.result}</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={350}>
            <div className="text-center mt-4">
              <p className="inline-block bg-primary-foreground/5 rounded-xl px-5 py-3">
                <span className="text-primary-foreground/80 text-sm">Mesma IA. </span>
                <span className="text-gold font-display font-bold text-sm">Resultado completamente diferente.</span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
