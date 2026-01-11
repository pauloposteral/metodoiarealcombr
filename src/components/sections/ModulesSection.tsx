import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  BookOpen, 
  Wrench, 
  MessageSquare, 
  FileText, 
  Briefcase, 
  Rocket, 
  DollarSign, 
  Brain,
  Play
} from 'lucide-react';
import realisPresenting from '@/assets/character/realis-presenting.png';

export const ModulesSection = () => {
  const modules = [
    {
      number: '01',
      icon: BookOpen,
      title: 'Fundamentos da IA',
      description: 'O que é IA, como funciona e por que você precisa entender agora.',
    },
    {
      number: '02',
      icon: Wrench,
      title: 'Ferramentas Essenciais',
      description: 'As principais ferramentas de IA e como escolher a melhor para você.',
    },
    {
      number: '03',
      icon: MessageSquare,
      title: 'Prompts que Funcionam',
      description: 'A arte de conversar com IA e obter resultados impressionantes.',
    },
    {
      number: '04',
      icon: FileText,
      title: 'IA para Conteúdo',
      description: 'Crie textos, imagens e vídeos profissionais com IA.',
    },
    {
      number: '05',
      icon: Briefcase,
      title: 'IA para Negócios',
      description: 'Aplique IA para vender mais, atender melhor e crescer.',
    },
    {
      number: '06',
      icon: Rocket,
      title: 'Produtividade com IA',
      description: 'Automatize tarefas e ganhe horas do seu dia.',
    },
    {
      number: '07',
      icon: DollarSign,
      title: 'IA como Renda Extra',
      description: 'Monetize suas habilidades com IA e crie novas fontes de receita.',
    },
    {
      number: '08',
      icon: Brain,
      title: 'O Jogo é Mental',
      description: 'Mentalidade e estratégia para se manter relevante na era da IA.',
    },
  ];

  return (
    <section id="modulos" className="py-20 md:py-28 bg-navy scroll-mt-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Left side - REALIS presenting */}
          <ScrollReveal direction="left" className="hidden lg:block lg:sticky lg:top-24">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-accent/15 via-gold/5 to-transparent rounded-full blur-3xl scale-90" />
              <img 
                src={realisPresenting}
                alt="REALIS apresentando os módulos do curso"
                className="relative z-10 w-full max-w-[320px] drop-shadow-2xl animate-character-entrance animate-character-glow"
              />
              {/* Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-navy-dark/90 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30">
                <span className="text-accent font-display font-bold text-xs tracking-wider">REALIS</span>
                <span className="text-primary-foreground/60 text-xs ml-2">apresentando</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Right side - Modules */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <div className="text-center lg:text-left mb-12">
                <span className="inline-block px-4 py-2 bg-accent/20 text-accent font-semibold text-sm rounded-full mb-6">
                  Conteúdo do Curso
                </span>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                  8 Módulos{' '}
                  <span className="text-gradient-gold">Completos</span>
                </h2>
                <p className="text-lg text-primary-foreground/70">
                  Uma jornada estruturada do zero ao avançado.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-4">
              {modules.map((module, index) => (
                <ScrollReveal key={index} delay={index * 60}>
                  <div className="group relative bg-navy-light/50 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-6 hover:border-accent/30 hover:bg-navy-light/70 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                          <module.icon className="w-7 h-7 text-accent" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-accent">MÓDULO {module.number}</span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-primary-foreground mb-1">
                          {module.title}
                        </h3>
                        <p className="text-sm text-primary-foreground/60 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          <Play className="w-4 h-4 text-accent ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
