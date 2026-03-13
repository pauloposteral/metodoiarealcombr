import { ScrollReveal } from '@/components/ScrollReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, ShieldCheck } from 'lucide-react';

const faqs = [
  {
    question: "Preciso ter conhecimento técnico?",
    answer: "Não! O curso foi criado para pessoas sem conhecimento técnico. Linguagem simples e exemplos práticos."
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer: "Cartão de crédito (até 12x sem juros), PIX (aprovação instantânea) e boleto bancário."
  },
  {
    question: "Como funciona a garantia de 7 dias?",
    answer: "Se não ficar satisfeito, basta solicitar o reembolso dentro de 7 dias. Devolvemos 100% do investimento, sem perguntas."
  },
  {
    question: "Por quanto tempo terei acesso?",
    answer: "Acesso vitalício. Assista quando quiser, para sempre. Inclui todas as atualizações futuras sem custo adicional."
  },
  {
    question: "Quando recebo acesso ao curso?",
    answer: "Acesso imediato! Após confirmação do pagamento (instantâneo para PIX e cartão), você já pode começar."
  },
  {
    question: "Tem certificado?",
    answer: "Sim! Ao concluir, você recebe um certificado de conclusão para comprovar seu conhecimento em IA aplicada."
  },
];

export const FAQSection = () => {
  return (
    <section className="py-10 md:py-16 bg-background relative overflow-hidden scroll-mt-12 md:scroll-mt-16" id="faq">
      <div className="container px-4 md:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-6 md:mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-light/10 text-navy-light rounded-full text-xs md:text-sm font-medium mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              Dúvidas Frequentes
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3 leading-tight">
              Perguntas Frequentes
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="bg-card border border-border/50 rounded-xl px-4 md:px-5 data-[state=open]:border-gold/30 data-[state=open]:shadow-elegant transition-all"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-gold hover:no-underline py-3 md:py-4 text-sm">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 leading-relaxed text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>

        {/* Guarantee Badge */}
        <ScrollReveal delay={200}>
          <div className="mt-6 max-w-2xl mx-auto p-4 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-xl border border-accent/20">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Garantia Incondicional de 7 Dias</h4>
                <p className="text-muted-foreground text-xs">
                  Devolvemos 100% do investimento se não ficar satisfeito. Sem perguntas, sem burocracia.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
