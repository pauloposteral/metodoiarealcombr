import { TopHeader } from '@/components/TopHeader';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProblemSolutionSection } from '@/components/sections/ProblemSolutionSection';
import { ModulesSection } from '@/components/sections/ModulesSection';
import { SocialProofSection } from '@/components/sections/SocialProofSection';
import { ForWhoSection } from '@/components/sections/ForWhoSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { FinalCTASection } from '@/components/sections/FinalCTASection';
import { Footer } from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

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
        "name": "Preciso ter conhecimento técnico?",
        "acceptedAnswer": { "@type": "Answer", "text": "Não. O curso foi criado para iniciantes. Linguagem simples, exemplos práticos." }
      },
      {
        "@type": "Question",
        "name": "Por quanto tempo terei acesso?",
        "acceptedAnswer": { "@type": "Answer", "text": "Vitalício. Assista quantas vezes quiser, com atualizações grátis para sempre." }
      },
      {
        "@type": "Question",
        "name": "Quais formas de pagamento?",
        "acceptedAnswer": { "@type": "Answer", "text": "Cartão em até 12x, PIX com aprovação instantânea e boleto bancário." }
      },
      {
        "@type": "Question",
        "name": "Como funciona a garantia?",
        "acceptedAnswer": { "@type": "Answer", "text": "7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor." }
      },
      {
        "@type": "Question",
        "name": "Quando recebo o acesso?",
        "acceptedAnswer": { "@type": "Answer", "text": "Imediato após a confirmação do pagamento." }
      },
      {
        "@type": "Question",
        "name": "Tem certificado?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sim. Certificado digital verificável ao concluir o curso." }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Método IA Real — Aprenda a usar IA de verdade no dia a dia</title>
        <meta name="description" content="Chega de tutorial solto. Aprenda IA vendo pessoas reais usando — e faça igual. Método prático, sem tecnicismo, para quem quer resultados." />
        <meta name="keywords" content="curso de IA, inteligência artificial, IA prática, IA aplicada, aprender IA, curso online IA, método IA, prompts IA, ChatGPT, produtividade com IA" />
        <meta property="og:title" content="Método IA Real — Aprenda a usar IA de verdade" />
        <meta property="og:description" content="Chega de tutorial solto. Aqui você vê como pessoas reais usam IA — e aprende a fazer igual." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/og-image.jpg" />
        <link rel="canonical" href="https://metodoiareal.com.br" />
        <script type="application/ld+json">{JSON.stringify(courseSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <TopHeader />
      <main className="overflow-hidden">
        <HeroSection />
        <ProblemSolutionSection />
        <ModulesSection />
        <SocialProofSection />
        <ForWhoSection />
        <FAQSection />
        <FinalCTASection />
        <Footer />
      </main>
    </>
  );
};

export default Index;
