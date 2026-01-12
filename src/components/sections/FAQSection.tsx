import { ScrollReveal } from '@/components/ScrollReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, CreditCard, Shield, ShieldCheck } from 'lucide-react';
import realisWelcoming from '@/assets/character/realis-welcoming.png';

const paymentFaqs = [
  {
    question: "Quais formas de pagamento são aceitas?",
    answer: "Aceitamos cartão de crédito (Visa, Mastercard, Elo, American Express, Hipercard), PIX (aprovação instantânea), boleto bancário (até 3 dias úteis para compensar) e parcelamento em até 12x no cartão."
  },
  {
    question: "O pagamento é seguro?",
    answer: "Sim! Utilizamos a plataforma Greenn, que possui certificado SSL e criptografia de ponta. Seus dados estão 100% protegidos. Nenhuma informação de cartão fica armazenada em nossos servidores."
  },
  {
    question: "Posso parcelar?",
    answer: "Sim! Você pode parcelar em até 12x no cartão de crédito. O valor de cada parcela é exibido na tela de pagamento antes de confirmar a compra."
  },
  {
    question: "Como funciona a garantia de 7 dias?",
    answer: "Oferecemos garantia incondicional de 7 dias. Se por qualquer motivo você não ficar satisfeito com o curso, basta solicitar o reembolso dentro do prazo e devolvemos 100% do seu investimento, sem perguntas."
  },
  {
    question: "Como solicitar reembolso?",
    answer: "Para solicitar reembolso, basta enviar um e-mail para contato@metodoiareal.com.br com o assunto 'Reembolso' dentro de 7 dias após a compra. Processamos em até 7 dias úteis."
  },
  {
    question: "Quando recebo acesso ao curso?",
    answer: "O acesso é imediato! Após a confirmação do pagamento (instantâneo para PIX e cartão), você recebe os dados de login no e-mail cadastrado e já pode começar a estudar."
  },
];

const generalFaqs = [
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
    <section className="py-12 md:py-20 lg:py-28 bg-background relative overflow-hidden scroll-mt-12 md:scroll-mt-16" id="faq">
      {/* Background decoration - Smaller on mobile */}
      <div className="absolute top-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-36 md:w-72 h-36 md:h-72 bg-navy-light/5 rounded-full blur-3xl -translate-x-1/2" />
      
      <div className="container px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* REALIS welcoming - Hidden on mobile */}
          <ScrollReveal direction="left" className="hidden lg:block lg:sticky lg:top-24">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-gold/10 via-accent/5 to-transparent rounded-full blur-3xl scale-90" />
              <img 
                src={realisWelcoming}
                alt="REALIS respondendo dúvidas"
                className="relative z-10 w-full max-w-[300px] drop-shadow-2xl animate-character-entrance animate-character-glow"
                loading="lazy"
              />
              {/* Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30">
                <span className="text-accent font-display font-bold text-xs tracking-wider">REALIS</span>
                <span className="text-muted-foreground text-xs ml-2">tirando dúvidas</span>
              </div>
            </div>
          </ScrollReveal>

          {/* FAQs */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <div className="text-center lg:text-left mb-8 md:mb-12">
                <span className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-navy-light/10 text-navy-light rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
                  <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Dúvidas Frequentes
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 md:mb-6 leading-tight">
                  Perguntas Frequentes
                </h2>
                <p className="text-base md:text-lg text-muted-foreground">
                  Tire suas dúvidas antes de começar sua jornada
                </p>
              </div>
            </ScrollReveal>

            {/* Payment & Guarantee FAQs */}
            <ScrollReveal delay={100}>
              <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">
                    Pagamento & Garantia
                  </h3>
                </div>
                <Accordion type="single" collapsible className="space-y-2 md:space-y-3">
                  {paymentFaqs.map((faq, index) => (
                    <AccordionItem 
                      key={`payment-${index}`} 
                      value={`payment-${index}`}
                      className="bg-accent/5 border border-accent/20 rounded-lg md:rounded-xl px-4 md:px-6 data-[state=open]:border-accent/40 data-[state=open]:shadow-gold transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:text-accent hover:no-underline py-4 md:py-5 text-sm md:text-base">
                        <span className="flex items-center gap-1.5 md:gap-2">
                          {index < 3 ? (
                            <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent flex-shrink-0" />
                          ) : (
                            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent flex-shrink-0" />
                          )}
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 md:pb-5 leading-relaxed pl-5 md:pl-6 text-sm">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollReveal>

            {/* General FAQs */}
            <ScrollReveal delay={200}>
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-navy-light/10 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-navy-light" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">
                    Sobre o Curso
                  </h3>
                </div>
                <Accordion type="single" collapsible className="space-y-2 md:space-y-3">
                  {generalFaqs.map((faq, index) => (
                    <AccordionItem 
                      key={`general-${index}`} 
                      value={`general-${index}`}
                      className="bg-card border border-border/50 rounded-lg md:rounded-xl px-4 md:px-6 data-[state=open]:border-gold/30 data-[state=open]:shadow-elegant transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:text-gold hover:no-underline py-4 md:py-5 text-sm md:text-base">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 md:pb-5 leading-relaxed text-sm">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollReveal>

            {/* Guarantee Badge */}
            <ScrollReveal delay={300}>
              <div className="mt-8 md:mt-12 p-4 md:p-6 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-xl md:rounded-2xl border border-accent/20">
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-7 h-7 md:w-10 md:h-10 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-bold text-foreground mb-1.5 md:mb-2">
                      Garantia Incondicional de 7 Dias
                    </h4>
                    <p className="text-muted-foreground text-xs md:text-sm">
                      Se dentro de 7 dias você não estiver 100% satisfeito com o curso, 
                      devolvemos todo o seu investimento. Sem perguntas, sem burocracia.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Additional CTA */}
            <ScrollReveal delay={400}>
              <div className="text-center mt-6 md:mt-8">
                <p className="text-muted-foreground text-sm mb-3 md:mb-4">
                  Ainda tem dúvidas?
                </p>
                <a 
                  href="mailto:contato@metodoiareal.com.br" 
                  className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-medium transition-colors py-2 px-3 -mx-3"
                >
                  Entre em contato conosco
                  <span className="text-xl">→</span>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
