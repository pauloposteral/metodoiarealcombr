import { ScrollReveal } from '@/components/ScrollReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const modules = [
  { num: '01', title: 'Fundamentos da IA', lessons: 6, desc: 'Entenda o que é IA de verdade — sem jargão técnico.' },
  { num: '02', title: 'Prompts que Funcionam', lessons: 8, desc: 'A arte de conversar com a IA. Frameworks e templates.' },
  { num: '03', title: 'IA no Dia a Dia', lessons: 10, desc: 'Aplique IA em e-mails, textos, planilhas, apresentações.' },
  { num: '04', title: 'IA para Negócios', lessons: 8, desc: 'Automatize processos, crie conteúdo, tome decisões melhores.' },
  { num: '05', title: 'Ferramentas Avançadas', lessons: 7, desc: 'ChatGPT, Claude, Gemini, Midjourney e mais.' },
  { num: '06', title: 'Projeto Final', lessons: 4, desc: 'Coloque tudo em prática num projeto real + certificado.' },
];

export const ModulesSection = () => {
  return (
    <section id="modulos" className="bg-[#08080C] py-[clamp(80px,10vw,120px)] scroll-mt-16">
      <div className="max-w-[760px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-[0.15em] uppercase text-[#3B82F6] mb-4">CONTEÚDO</span>
            <h2 className="font-landing font-bold text-white leading-[1.12] tracking-[-0.03em] mb-3" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              6 módulos. 43 aulas. Zero enrolação.
            </h2>
            <p className="text-white/55" style={{ fontSize: 'clamp(16px, 2vw, 18px)' }}>
              Do fundamento à prática avançada.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Accordion type="single" collapsible className="space-y-3">
            {modules.map((m, i) => (
              <AccordionItem
                key={i}
                value={`mod-${i}`}
                className="border border-white/[0.06] bg-white/[0.02] rounded-xl px-5 data-[state=open]:border-[#3B82F6]/30 transition-colors duration-200"
              >
                <AccordionTrigger className="hover:no-underline py-5 gap-4">
                  <div className="flex items-center gap-4 text-left flex-1">
                    <span className="text-[#3B82F6]/60 font-landing font-bold text-sm w-6 flex-shrink-0">{m.num}</span>
                    <span className="font-landing font-semibold text-white text-sm sm:text-base flex-1">{m.title}</span>
                    <span className="text-white/35 text-xs flex-shrink-0">{m.lessons} aulas</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/55 text-sm pb-5 pl-10 leading-relaxed">
                  {m.desc}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
};
