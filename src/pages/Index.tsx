import { HeroSection } from '@/components/sections/HeroSection';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { TargetAudienceSection } from '@/components/sections/TargetAudienceSection';
import { LearningSection } from '@/components/sections/LearningSection';
import { ModulesSection } from '@/components/sections/ModulesSection';
import { DifferentialsSection } from '@/components/sections/DifferentialsSection';
import { BonusSection } from '@/components/sections/BonusSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { FinalCTASection } from '@/components/sections/FinalCTASection';
import { Footer } from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Método IA Real — Curso de Inteligência Artificial Prática | Aprenda IA do Zero</title>
        <meta 
          name="description" 
          content="Aprenda a usar inteligência artificial de forma prática. Curso de IA aplicada para iniciantes, empreendedores e criadores de conteúdo. Método estruturado, sem tecnicismos. Comece do zero." 
        />
        <meta name="keywords" content="curso de IA, inteligência artificial, IA prática, IA aplicada, aprender IA, curso online IA, método IA, prompts IA, ChatGPT, produtividade com IA" />
        <meta property="og:title" content="Método IA Real — Inteligência Artificial Aplicada ao Mundo Real" />
        <meta property="og:description" content="Aprenda a usar a IA de forma prática para trabalhar melhor, criar mais e ganhar tempo — mesmo começando do zero." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://metodoiareal.com.br" />
      </Helmet>
      
      <main className="overflow-hidden">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <TargetAudienceSection />
        <LearningSection />
        <ModulesSection />
        <DifferentialsSection />
        <BonusSection />
        <HowItWorksSection />
        <FinalCTASection />
        <Footer />
      </main>
    </>
  );
};

export default Index;
