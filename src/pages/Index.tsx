import { HeroSection } from '@/components/sections/HeroSection';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { HowAIWorksSection } from '@/components/sections/HowAIWorksSection';
import { ComparisonSection } from '@/components/sections/ComparisonSection';
import { StepByStepSection } from '@/components/sections/StepByStepSection';
import { PromptExampleSection } from '@/components/sections/PromptExampleSection';
import { LearningMapSection } from '@/components/sections/LearningMapSection';
import { WhatYouLearnSection } from '@/components/sections/WhatYouLearnSection';
import { RealProofSection } from '@/components/sections/RealProofSection';
import { HumanSection } from '@/components/sections/HumanSection';
import { TargetAudienceSection } from '@/components/sections/TargetAudienceSection';
import { ModulesSection } from '@/components/sections/ModulesSection';
import { DifferentialsSection } from '@/components/sections/DifferentialsSection';
import { BonusSection } from '@/components/sections/BonusSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
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
import { FloatingRating } from '@/components/landing/FloatingRating';
import { PricingAnchor } from '@/components/landing/PricingAnchor';
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection';
import { StorytellingSection } from '@/components/landing/StorytellingSection';
import { ObjectionHandler } from '@/components/landing/ObjectionHandler';

const Index = () => {
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Método IA Real",
    "description": "Curso completo de Inteligência Artificial prática. Aprenda a usar IA no dia a dia sem tecnicismos, com método claro e aplicável para pessoas e negócios reais.",
    "provider": {
      "@type": "Organization",
      "name": "Método IA Real",
      "url": "https://metodoiareal.com.br"
    },
    "educationalLevel": "Iniciante a Intermediário",
    "inLanguage": "pt-BR",
    "coursePrerequisites": "Nenhum conhecimento técnico necessário",
    "numberOfCredits": "8 horas",
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "courseWorkload": "PT8H"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2500",
      "bestRating": "5"
    },
    "offers": {
      "@type": "Offer",
      "category": "Curso Online",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "BRL"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Quais formas de pagamento são aceitas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aceitamos cartão de crédito (Visa, Mastercard, Elo, American Express, Hipercard), PIX (aprovação instantânea), boleto bancário (até 3 dias úteis para compensar) e parcelamento em até 12x no cartão."
        }
      },
      {
        "@type": "Question",
        "name": "Como funciona a garantia de 7 dias?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oferecemos garantia incondicional de 7 dias. Se por qualquer motivo você não ficar satisfeito com o curso, basta solicitar o reembolso dentro do prazo e devolvemos 100% do seu investimento, sem perguntas."
        }
      },
      {
        "@type": "Question",
        "name": "Preciso ter conhecimento técnico para fazer o curso?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Não! O Método IA Real foi criado justamente para pessoas sem conhecimento técnico. Você vai aprender do zero, com uma linguagem simples e exemplos práticos do dia a dia."
        }
      },
      {
        "@type": "Question",
        "name": "Por quanto tempo terei acesso ao curso?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "O acesso é vitalício. Você pode assistir e reassistir quantas vezes quiser, para sempre. Além disso, terá acesso a todas as atualizações futuras sem custo adicional."
        }
      },
      {
        "@type": "Question",
        "name": "Quando recebo acesso ao curso?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "O acesso é imediato! Após a confirmação do pagamento (instantâneo para PIX e cartão), você recebe os dados de login no e-mail cadastrado e já pode começar a estudar."
        }
      },
      {
        "@type": "Question",
        "name": "Tem certificado?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim! Ao concluir o curso, você recebe um certificado de conclusão que pode ser usado para comprovar seu conhecimento em IA aplicada."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Método IA Real — 2.500+ alunos já usam IA no trabalho</title>
        <meta 
          name="description" 
          content="Aprenda IA em 7 dias com método prático. 2.500+ alunos, 4.9/5 de avaliação. Sem tecnicismo, resultados reais. Garantia de 7 dias." 
        />
        <meta name="keywords" content="curso de IA, inteligência artificial, IA prática, IA aplicada, aprender IA, curso online IA, método IA, prompts IA, ChatGPT, produtividade com IA" />
        <meta property="og:title" content="Método IA Real — 2.500+ alunos já usam IA no trabalho" />
        <meta property="og:description" content="Aprenda IA em 7 dias. Método prático, sem tecnicismo. Garantia de 7 dias." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/og-image.jpg" />
        <link rel="canonical" href="https://metodoiareal.com.br" />
        <script type="application/ld+json">
          {JSON.stringify(courseSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      {/* Conversion overlays */}
      <UrgencyBar />
      <ReadingProgress />
      <FloatingRating />
      <StickyMobileCTA />
      <WhatsAppBubble />
      <ExitIntentPopup />
      
      <TopHeader />
      <main className="overflow-hidden">
        {/* Hero & Problem */}
        <HeroSection />
        <ProblemSection />
        
        {/* Objection handler #1 */}
        <ObjectionHandler
          objection="Mas eu não entendo nada de tecnologia..."
          answer="Perfeito! O curso foi feito justamente pra quem não é técnico. Você vai aprender usando linguagem simples e exemplos do dia a dia."
        />
        
        {/* Solution & How it works */}
        <SolutionSection />
        <HowAIWorksSection />
        <ComparisonSection />
        
        {/* Before/After quantified comparison */}
        <BeforeAfterSection />
        
        <StepByStepSection />
        
        {/* Objection handler #2 */}
        <ObjectionHandler
          objection="Já vi outros cursos de IA e não funcionou..."
          answer="A diferença é o método. Aqui você não aprende teoria — você vê pessoas reais usando e replica o processo. Por isso 98% dos alunos aprovam."
        />
        
        {/* Real proof with example */}
        <PromptExampleSection />
        <RealProofSection />
        
        {/* Storytelling */}
        <StorytellingSection />
        
        {/* Learning journey */}
        <LearningMapSection />
        <WhatYouLearnSection />
        
        {/* Social proof & human touch */}
        <HumanSection />
        <TargetAudienceSection />
        
        {/* Objection handler #3 */}
        <ObjectionHandler
          objection="E se eu não tiver tempo?"
          answer="O curso tem 8h no total e você faz no seu ritmo. A maioria dos alunos estuda 30 min/dia e conclui em 2 semanas. Acesso vitalício."
        />
        
        {/* Course details */}
        <ModulesSection />
        <DifferentialsSection />
        <BonusSection />
        <HowItWorksSection />
        
        {/* Pricing with anchoring */}
        <PricingAnchor />
        
        {/* Final conversion */}
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
        <Footer />
      </main>
    </>
  );
};

export default Index;
