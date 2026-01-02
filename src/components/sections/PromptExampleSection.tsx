import { ScrollReveal } from '@/components/ScrollReveal';
import { MessageSquare, ArrowRight, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';

const example = {
  context: "Você precisa criar um post para Instagram sobre seu negócio",
  steps: [
    {
      phase: "1",
      label: "Prompt inicial",
      type: "input",
      content: "Crie um post para Instagram sobre minha loja de roupas",
      result: "A IA gera algo genérico e sem personalidade"
    },
    {
      phase: "2",
      label: "Com o método",
      type: "input",
      content: "Atue como um especialista em moda feminina. Crie um post de Instagram para uma loja de roupas focada em mulheres de 25-40 anos. Tom: descontraído e inspirador. Inclua: 1 gancho forte, 3 benefícios e 1 CTA. Máximo 150 palavras.",
      result: null
    },
    {
      phase: "3",
      label: "Resultado",
      type: "output",
      content: "✨ Sabe aquela sensação de se olhar no espelho e se sentir incrível?\n\nNa [Nome da Loja], cada peça foi escolhida pensando em você:\n\n→ Conforto o dia todo\n→ Estilo sem esforço\n→ Peças que combinam com tudo\n\nModa que valoriza quem você é. Simples assim.\n\n📍 Link na bio | Frete grátis acima de R$199",
      result: null
    }
  ]
};

export const PromptExampleSection = () => {
  return (
    <section className="py-20 md:py-28 bg-navy relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent font-semibold text-sm rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              Exemplo Real
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Veja a diferença de{' '}
              <span className="text-gradient-gold">um bom prompt</span>
            </h2>
            <p className="text-lg text-primary-foreground/70 leading-relaxed">
              {example.context}
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Step 1: Bad prompt */}
            <ScrollReveal delay={100}>
              <div className="bg-navy-light/50 rounded-2xl p-6 border border-primary-foreground/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive text-sm font-bold">
                    1
                  </div>
                  <span className="text-xs font-medium text-destructive">Prompt genérico</span>
                </div>
                <div className="bg-navy rounded-xl p-4 border border-primary-foreground/5">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary-foreground/40 mt-0.5" />
                    <p className="text-primary-foreground/80 text-sm italic">
                      "{example.steps[0].content}"
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-destructive/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
                  {example.steps[0].result}
                </p>
              </div>
            </ScrollReveal>

            {/* Arrow */}
            <ScrollReveal delay={150}>
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-accent">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                  <span className="text-xs font-medium">Aplicando o método...</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 2: Good prompt */}
            <ScrollReveal delay={200}>
              <div className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
                    2
                  </div>
                  <span className="text-xs font-medium text-accent">Prompt estruturado</span>
                </div>
                <div className="bg-navy rounded-xl p-4 border border-accent/10">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-accent mt-0.5" />
                    <p className="text-primary-foreground text-sm">
                      "{example.steps[1].content}"
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Papel definido", "Contexto claro", "Tom especificado", "Formato pedido"].map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Arrow */}
            <ScrollReveal delay={250}>
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-gold">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                  <span className="text-xs font-medium">Resultado...</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 3: Result */}
            <ScrollReveal delay={300}>
              <div className="bg-green-500/10 rounded-2xl p-6 border border-green-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm font-bold">
                    3
                  </div>
                  <span className="text-xs font-medium text-green-500">Resultado pronto para usar</span>
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                </div>
                <div className="bg-navy rounded-xl p-5 border border-green-500/10">
                  <p className="text-primary-foreground text-sm whitespace-pre-line leading-relaxed">
                    {example.steps[2].content}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Bottom insight */}
          <ScrollReveal delay={400}>
            <div className="mt-10 text-center">
              <div className="inline-block bg-primary-foreground/5 rounded-2xl p-6">
                <p className="text-primary-foreground/80 text-sm mb-2">
                  Mesma IA. Mesma ferramenta.
                </p>
                <p className="text-gold font-display font-bold text-lg">
                  Resultado completamente diferente.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
