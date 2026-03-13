import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  BookOpen, Wrench, MessageSquare, FileText, Briefcase, Rocket, DollarSign, Brain
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const ModulesSection = () => {
  const modules = [
    { number: '01', icon: BookOpen, title: 'Fundamentos da IA', description: 'O que é IA, como funciona e por que você precisa entender agora.' },
    { number: '02', icon: Wrench, title: 'Ferramentas Essenciais', description: 'As principais ferramentas de IA e como escolher a melhor para você.' },
    { number: '03', icon: MessageSquare, title: 'Prompts que Funcionam', description: 'A arte de conversar com IA e obter resultados impressionantes.' },
    { number: '04', icon: FileText, title: 'IA para Conteúdo', description: 'Crie textos, imagens e vídeos profissionais com IA.' },
    { number: '05', icon: Briefcase, title: 'IA para Negócios', description: 'Aplique IA para vender mais, atender melhor e crescer.' },
    { number: '06', icon: Rocket, title: 'Produtividade com IA', description: 'Automatize tarefas e ganhe horas do seu dia.' },
    { number: '07', icon: DollarSign, title: 'IA como Renda Extra', description: 'Monetize suas habilidades com IA e crie novas fontes de receita.' },
    { number: '08', icon: Brain, title: 'O Jogo é Mental', description: 'Mentalidade e estratégia para se manter relevante na era da IA.' },
  ];

  return (
    <section id="modulos" className="py-10 md:py-16 bg-navy scroll-mt-12 md:scroll-mt-16 relative overflow-hidden">
      <div className="absolute top-10 right-0 w-48 md:w-72 h-48 md:h-72 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container px-4 md:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-6 md:mb-8">
            <span className="inline-block px-3 py-1.5 bg-accent/20 text-accent font-semibold text-xs md:text-sm rounded-full mb-4">
              Conteúdo do Curso
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-3 leading-tight">
              8 Módulos{' '}
              <span className="text-gradient-gold">Completos</span>
            </h2>
            <p className="text-sm md:text-base text-primary-foreground/70">
              Uma jornada estruturada do zero ao avançado.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="max-w-2xl mx-auto">
            <Accordion type="multiple" className="space-y-2">
              {modules.map((module, index) => (
                <AccordionItem 
                  key={index} 
                  value={`module-${index}`}
                  className="bg-navy-light/50 backdrop-blur-sm border border-primary-foreground/10 rounded-xl px-4 md:px-5 data-[state=open]:border-accent/30 transition-all"
                >
                  <AccordionTrigger className="hover:no-underline py-3 md:py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <module.icon className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] md:text-xs font-bold text-accent">MÓDULO {module.number}</span>
                        <h3 className="font-display font-bold text-sm md:text-base text-primary-foreground">
                          {module.title}
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-primary-foreground/60 pb-4 pl-12 md:pl-[52px]">
                    {module.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
