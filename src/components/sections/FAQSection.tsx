import { ScrollReveal } from '@/components/ScrollReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  { q: 'Preciso ter conhecimento técnico?', a: 'Não. O curso foi criado para iniciantes. Linguagem simples, exemplos práticos.' },
  { q: 'Por quanto tempo terei acesso?', a: 'Vitalício. Assista quantas vezes quiser, com atualizações grátis para sempre.' },
  { q: 'Quais formas de pagamento?', a: 'Cartão em até 12x, PIX com aprovação instantânea e boleto bancário.' },
  { q: 'Como funciona a garantia?', a: '7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor.' },
  { q: 'Quando recebo o acesso?', a: 'Imediato após a confirmação do pagamento. Cartão e PIX são instantâneos.' },
  { q: 'Tem certificado?', a: 'Sim. Certificado digital verificável ao concluir o curso.' },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="bg-[#08080C] py-[clamp(80px,10vw,120px)] scroll-mt-16">
      <div className="max-w-[680px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="font-landing font-bold text-white leading-[1.12] tracking-[-0.03em]" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              Perguntas frequentes
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-white/[0.06] bg-white/[0.02] rounded-xl px-5 data-[state=open]:border-white/[0.12] transition-colors duration-200"
              >
                <AccordionTrigger className="hover:no-underline py-5 text-left font-landing font-semibold text-white text-sm sm:text-base [&[data-state=open]>svg]:rotate-45">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/55 text-sm pb-5 leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
};
