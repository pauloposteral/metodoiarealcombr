import { HeroSection } from '@/components/sections/HeroSection';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { ComparisonSection } from '@/components/sections/ComparisonSection';
import { PromptExampleSection } from '@/components/sections/PromptExampleSection';
import { LearningSection } from '@/components/sections/LearningSection';
import { TargetAudienceSection } from '@/components/sections/TargetAudienceSection';
import { ModulesSection } from '@/components/sections/ModulesSection';
import { BonusSection } from '@/components/sections/BonusSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { FinalCTASection } from '@/components/sections/FinalCTASection';
import { Footer } from '@/components/Footer';
import { TopHeader } from '@/components/TopHeader';
import { Helmet } from 'react-helmet-async';

// Landing page conversion components
import { UrgencyBar } from '@/components/landing/UrgencyBar';
import { StickyMobileCTA } from '@/components/landing/StickyMobileCTA';
import { WhatsAppBubble } from '@/components/landing/WhatsAppBubble';
import { ReadingProgress } from '@/components/landing/ReadingProgress';
import { ExitIntentPopup } from '@/components/landing/ExitIntentPopup';
import { PricingAnchor } from '@/components/landing/PricingAnchor';
import { ObjectionHandler } from '@/components/landing/ObjectionHandler';

const Index = () => {
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Método IA Real",
    "description": "Curso completo de Inteligência Artificial prática. Aprenda a usar IA no dia a dia sem tecnicismos.",
    "provider": { "@type": "Organization", "name": "Método IA Real", "url": "https://metodoiareal.com.br" },
    "educationalLevel": "Iniciante a Intermediário",
    "inLanguage": "pt-BR",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "2500", "bestRating": "5" },
    "offers": { "@type": "Offer", "category": "Curso Online", "availability": "https://schema.org/InStock", "priceCurrency": "BRL" }
  };

  return (
    <>
      <Helmet>
        <title>Método IA Real — 2.500+ alunos já usam IA no trabalho</title>
        <meta name="description" content="Aprenda IA em 7 dias com método prático. 2.500+ alunos, 4.9/5 de avaliação. Sem tecnicismo, resultados reais. Garantia de 7 dias." />
        <meta property="og:title" content="Método IA Real — 2.500+ alunos já usam IA no trabalho" />
        <meta property="og:description" content="Aprenda IA em 7 dias. Método prático, sem tecnicismo. Garantia de 7 dias." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.jpg" />
        <link rel="canonical" href="https://metodoiareal.com.br" />
        <script type="application/ld+json">{JSON.stringify(courseSchema)}</script>
      </Helmet>
      
      {/* Conversion overlays */}
      <UrgencyBar />
      <ReadingProgress />
      <StickyMobileCTA />
      <WhatsAppBubble />
      <ExitIntentPopup />
      
      <TopHeader />
      <main className="overflow-hidden">
        <HeroSection />
        <ProblemSection />
        
        <ObjectionHandler
          objection="Mas eu não entendo nada de tecnologia..."
          answer="Perfeito! O curso foi feito pra quem não é técnico. Linguagem simples e exemplos do dia a dia."
        />
        
        <SolutionSection />
        <ProcessSection />
        <ComparisonSection />
        <PromptExampleSection />
        <LearningSection />
        <ModulesSection />
        <TargetAudienceSection />
        <BonusSection />
        <PricingAnchor />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
        <Footer />
      </main>
    </>
  );
};

export default Index;
