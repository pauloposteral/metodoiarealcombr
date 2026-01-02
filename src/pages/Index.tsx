import { HeroSection } from '@/components/sections/HeroSection';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { RealProofSection } from '@/components/sections/RealProofSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { HumanSection } from '@/components/sections/HumanSection';
import { TargetAudienceSection } from '@/components/sections/TargetAudienceSection';
import { LearningSection } from '@/components/sections/LearningSection';
import { StorytellingSection } from '@/components/sections/StorytellingSection';
import { ModulesSection } from '@/components/sections/ModulesSection';
import { DifferentialsSection } from '@/components/sections/DifferentialsSection';
import { BonusSection } from '@/components/sections/BonusSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { FinalCTASection } from '@/components/sections/FinalCTASection';
import { Footer } from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Método IA Real — Aprenda a usar IA de verdade no dia a dia</title>
        <meta 
          name="description" 
          content="Chega de tutorial solto. Aprenda IA vendo pessoas reais usando — e faça igual. Método prático, sem tecnicismo, para quem quer resultados." 
        />
        <meta name="keywords" content="curso de IA, inteligência artificial, IA prática, IA aplicada, aprender IA, curso online IA, método IA, prompts IA, ChatGPT, produtividade com IA" />
        <meta property="og:title" content="Método IA Real — Aprenda a usar IA de verdade" />
        <meta property="og:description" content="Chega de tutorial solto. Aqui você vê como pessoas reais usam IA — e aprende a fazer igual." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://metodoiareal.com.br" />
      </Helmet>
      
      <main className="overflow-hidden">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <RealProofSection />
        <ProcessSection />
        <HumanSection />
        <TargetAudienceSection />
        <LearningSection />
        <StorytellingSection />
        <ModulesSection />
        <DifferentialsSection />
        <BonusSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
        <Footer />
      </main>
    </>
  );
};

export default Index;
