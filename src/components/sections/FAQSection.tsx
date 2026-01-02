import { ScrollReveal } from '@/components/ScrollReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Preciso ter conhecimento técnico para fazer o curso?",
    answer: "Não! O Método IA Real foi criado justamente para pessoas sem conhecimento técnico. Você vai aprender do zero, com uma linguagem simples e exemplos práticos do dia a dia."
  },
  {
    question: "Quanto tempo leva para concluir o curso?",
    answer: "O curso tem aproximadamente 8 horas de conteúdo, mas você pode assistir no seu ritmo. A maioria dos alunos conclui em 1 a 2 semanas, dedicando cerca de 1 hora por dia."
  },
  {
    question: "O curso funciona para qualquer profissão?",
    answer: "Sim! O método é universal. Seja você advogado, médico, professor, empreendedor, designer ou de qualquer outra área, as técnicas se aplicam ao seu contexto profissional."
  },
  {
    question: "Por quanto tempo terei acesso ao curso?",
    answer: "O acesso é vitalício. Você pode assistir e reassistir quantas vezes quiser, para sempre. Além disso, terá acesso a todas as atualizações futuras sem custo adicional."
  },
  {
    question: "As aulas são ao vivo ou gravadas?",
    answer: "As aulas são 100% gravadas, o que significa que você pode assistir quando e onde quiser, no seu próprio ritmo. Não precisa se preocupar com horários fixos."
  },
  {
    question: "Tem certificado?",
    answer: "Sim! Ao concluir o curso, você recebe um certificado de conclusão que pode ser usado para comprovar seu conhecimento em IA aplicada."
  },
  {
    question: "E se eu não gostar do curso?",
    answer: "Oferecemos garantia de 7 dias. Se por qualquer motivo você não ficar satisfeito, basta solicitar o reembolso dentro do prazo e devolvemos 100% do seu investimento."
  },
  {
    question: "Terei suporte se tiver dúvidas?",
    answer: "Sim! Você terá acesso a uma comunidade exclusiva de alunos onde poderá tirar dúvidas e trocar experiências com outros estudantes e mentores."
  },
  {
    question: "O curso é atualizado?",
    answer: "Sim! A IA evolui rapidamente e nosso conteúdo também. Todas as atualizações de ferramentas e técnicas são incluídas no seu acesso, sem custo adicional."
  },
  {
    question: "Posso assistir pelo celular?",
    answer: "Sim! A plataforma é 100% responsiva. Você pode acessar pelo computador, tablet ou celular, com a mesma qualidade de experiência."
  }
];

export const FAQSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-navy-light/10 text-navy-light rounded-full text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              Dúvidas Frequentes
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tire suas dúvidas antes de começar sua jornada
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:border-gold/30 data-[state=open]:shadow-elegant transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-gold hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>

        {/* Additional CTA */}
        <ScrollReveal delay={0.4}>
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Ainda tem dúvidas?
            </p>
            <a 
              href="mailto:contato@metodoiareal.com.br" 
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-medium transition-colors"
            >
              Entre em contato conosco
              <span className="text-xl">→</span>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
