import { ScrollReveal } from '@/components/ScrollReveal';
import {
  Rocket, Brain, MessageSquare, Bot, Sparkles, Search,
  Image, Video, Code2, Workflow, Zap, TrendingUp, DollarSign
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const ModulesSection = () => {
  const modules = [
    { number: '00', icon: Rocket, title: 'Comece por aqui', description: 'Onboarding: como aproveitar ao máximo a Escola de IA e escolher sua trilha ideal.' },
    { number: '01', icon: Brain, title: 'Fundamentos: como a IA pensa', description: 'Entenda de verdade o que é IA generativa, LLMs, tokens e por que isso muda tudo.' },
    { number: '02', icon: MessageSquare, title: 'Engenharia de Prompt', description: 'A arte e a técnica de conversar com IA para obter resultados profissionais.' },
    { number: '03', icon: Bot, title: 'ChatGPT do zero ao avançado', description: 'Domine o ChatGPT: GPTs personalizados, projetos, memória, análise de dados e mais.' },
    { number: '04', icon: Sparkles, title: 'Claude do zero ao avançado', description: 'A IA da Anthropic: raciocínio profundo, escrita longa, artifacts e workflows.' },
    { number: '05', icon: Search, title: 'Gemini e ecossistema Google', description: 'Integre IA com Docs, Sheets, Gmail e todo o Google Workspace.' },
    { number: '06', icon: Image, title: 'Imagem: do prompt à arte profissional', description: 'Midjourney, DALL-E, Nano Banana e ferramentas para criar imagens profissionais.' },
    { number: '07', icon: Video, title: 'Vídeo, voz e música com IA', description: 'Sora, Runway, ElevenLabs, Suno: crie vídeos, áudios e músicas com IA.' },
    { number: '08', icon: Code2, title: 'Lovable: primeiro app sem código', description: '⭐ Crie apps reais sem programar. Do zero ao MVP publicado.' },
    { number: '09', icon: Workflow, title: 'Automações e agentes', description: 'n8n, Make, Zapier e agentes autônomos que trabalham por você 24/7.' },
    { number: '10', icon: Zap, title: 'IA no trabalho: produtividade', description: 'Aplique IA em relatórios, reuniões, apresentações e rotina profissional.' },
    { number: '11', icon: TrendingUp, title: 'IA para negócios e conteúdo', description: 'Marketing, vendas, atendimento e criação de conteúdo em escala com IA.' },
    { number: '12', icon: DollarSign, title: 'Monetização: os 5 caminhos', description: 'Como transformar IA em renda: freelas, serviços, produtos, cursos e SaaS.' },
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
              13 Módulos{' '}
              <span className="text-gradient-gold">Completos</span>
            </h2>
            <p className="text-sm md:text-base text-primary-foreground/70">
              Do onboarding à monetização — uma jornada estruturada do zero ao avançado.
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
