import { ScrollReveal } from '@/components/ScrollReveal';
import { Clock, Zap, ArrowRight } from 'lucide-react';

const comparisons = [
  {
    task: 'Criar post para rede social',
    before: { time: '2 horas', steps: 'Pesquisar → pensar → escrever → revisar → formatar' },
    after: { time: '10 minutos', steps: 'Prompt → gerar → personalizar → publicar' },
  },
  {
    task: 'Responder e-mails profissionais',
    before: { time: '45 minutos', steps: 'Ler → pensar tom → rascunho → revisar' },
    after: { time: '5 minutos', steps: 'Copiar contexto → prompt → enviar' },
  },
  {
    task: 'Montar proposta comercial',
    before: { time: '3 horas', steps: 'Pesquisar → estruturar → escrever → formatar' },
    after: { time: '20 minutos', steps: 'Dados + prompt → gerar → ajustar' },
  },
];

export const BeforeAfterSection = () => {
  return (
    <section className="py-12 md:py-20 bg-background relative overflow-hidden">
      <div className="container px-4 md:px-8">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold text-sm rounded-full mb-4">
              Resultado Real
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Antes vs. Depois{' '}
              <span className="text-gradient-gold">do Método</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {comparisons.map((item, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="bg-card border border-border/50 rounded-xl md:rounded-2xl overflow-hidden">
                <div className="bg-muted/50 px-4 md:px-6 py-3">
                  <p className="text-sm font-semibold text-foreground">{item.task}</p>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                  {/* Before */}
                  <div className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-destructive" />
                      <span className="text-xs font-semibold text-destructive uppercase">Sem IA</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1">{item.before.time}</p>
                    <p className="text-xs text-muted-foreground">{item.before.steps}</p>
                  </div>
                  {/* After */}
                  <div className="p-4 md:p-6 bg-green-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-semibold text-green-500 uppercase">Com Método IA</span>
                    </div>
                    <p className="text-2xl font-bold text-green-500 mb-1">{item.after.time}</p>
                    <p className="text-xs text-muted-foreground">{item.after.steps}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Resultado médio dos alunos após 7 dias de curso
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
