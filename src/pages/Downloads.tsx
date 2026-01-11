import { Helmet } from "react-helmet-async";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopHeader } from "@/components/TopHeader";
import { Footer } from "@/components/Footer";
import StoryTemplateEditor from "@/components/StoryTemplateEditor";

// REALIS character images
import realisGuiding from "@/assets/character/realis-guiding.png";
import realisThinking from "@/assets/character/realis-thinking.png";
import realisTeaching from "@/assets/character/realis-teaching.png";
import realisPresenting from "@/assets/character/realis-presenting.png";
import realisConfident from "@/assets/character/realis-confident.png";
import realisWelcoming from "@/assets/character/realis-welcoming.png";

// REALIS Social Media versions
import realisStoriesWelcome from "@/assets/character/realis-stories-welcome.png";
import realisReelsTeaching from "@/assets/character/realis-reels-teaching.png";
import realisStoriesThinking from "@/assets/character/realis-stories-thinking.png";
import realisFeedSquare from "@/assets/character/realis-feed-square.png";

const characterAssets = [
  {
    id: "guiding",
    name: "REALIS Guiando",
    description: "Pose apontando e guiando, ideal para CTAs e direcionamentos",
    image: realisGuiding,
    filename: "realis-guiding.png",
  },
  {
    id: "thinking",
    name: "REALIS Pensando",
    description: "Pose reflexiva, perfeita para seções de análise e estratégia",
    image: realisThinking,
    filename: "realis-thinking.png",
  },
  {
    id: "teaching",
    name: "REALIS Ensinando",
    description: "Pose didática com tablet holográfico, ideal para conteúdo educacional",
    image: realisTeaching,
    filename: "realis-teaching.png",
  },
  {
    id: "presenting",
    name: "REALIS Apresentando",
    description: "Apontando para cima, perfeito para destacar módulos e conteúdos",
    image: realisPresenting,
    filename: "realis-presenting.png",
  },
  {
    id: "confident",
    name: "REALIS Confiante",
    description: "Braços cruzados, ideal para depoimentos e resultados",
    image: realisConfident,
    filename: "realis-confident.png",
  },
  {
    id: "welcoming",
    name: "REALIS Acolhendo",
    description: "Mãos abertas em boas-vindas, perfeito para FAQ e suporte",
    image: realisWelcoming,
    filename: "realis-welcoming.png",
  },
];

const socialMediaAssets = [
  {
    id: "stories-welcome",
    name: "REALIS Stories - Boas-vindas",
    description: "Pose elegante para Stories, com espaço para texto acima e abaixo",
    image: realisStoriesWelcome,
    filename: "realis-stories-welcome.png",
    dimensions: "1080 x 1920",
    aspectRatio: "aspect-[9/16]",
  },
  {
    id: "reels-teaching",
    name: "REALIS Reels - Ensinando",
    description: "Gesto de ensino dinâmico, perfeito para Reels educativos",
    image: realisReelsTeaching,
    filename: "realis-reels-teaching.png",
    dimensions: "1080 x 1920",
    aspectRatio: "aspect-[9/16]",
  },
  {
    id: "stories-thinking",
    name: "REALIS Stories - Pensando",
    description: "Pose reflexiva contemplativa, ideal para dicas e insights",
    image: realisStoriesThinking,
    filename: "realis-stories-thinking.png",
    dimensions: "1080 x 1920",
    aspectRatio: "aspect-[9/16]",
  },
  {
    id: "feed-square",
    name: "REALIS Feed - Quadrado",
    description: "Formato quadrado perfeito para posts de feed do Instagram",
    image: realisFeedSquare,
    filename: "realis-feed-square.png",
    dimensions: "1080 x 1080",
    aspectRatio: "aspect-square",
  },
];

const Downloads = () => {
  const handleDownload = (imageSrc: string, filename: string) => {
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Helmet>
        <title>Downloads - REALIS - Personagem Método IA Real</title>
        <meta
          name="description"
          content="Baixe o personagem REALIS, mentor oficial do Método IA Real em diferentes poses para usar em suas campanhas e materiais."
        />
      </Helmet>

      <TopHeader />

      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-4">
              Assets Oficiais
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
              <span className="text-gradient-gold">REALIS</span> - Seu Mentor de IA
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conheça REALIS, o mentor visual do Método IA Real. Um personagem futurístico,
              elegante e humano que representa inteligência prática, clareza e método.
            </p>
          </div>

          {/* Story Template Editor Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-4">
                ✨ Editor de Templates
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Crie seu Story Personalizado
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Edite textos e cores para criar Stories únicos com o REALIS. Exporte diretamente para o Instagram.
              </p>
            </div>
            <StoryTemplateEditor />
          </div>

          {/* Character Grid */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
                🎨 Poses para Site
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Variações do REALIS
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Diferentes poses para usar em materiais, site e apresentações
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {characterAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-accent/50 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-navy-dark/20 to-navy-dark/5">
                    <img
                      src={asset.image}
                      alt={asset.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {asset.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {asset.description}
                    </p>
                    <Button
                      onClick={() => handleDownload(asset.image, asset.filename)}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PNG
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
                📱 Instagram Stories, Reels & Feed
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Versões para Redes Sociais
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Imagens otimizadas para Stories (9:16), Reels e Feed (1:1) do Instagram
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {socialMediaAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300"
                >
                  {/* Image */}
                  <div className={`${asset.aspectRatio} overflow-hidden bg-gradient-to-br from-navy-dark/20 to-navy-dark/5`}>
                    <img
                      src={asset.image}
                      alt={asset.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Dimensions Badge */}
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-foreground">{asset.dimensions}</span>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {asset.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {asset.description}
                    </p>
                    <Button
                      onClick={() => handleDownload(asset.image, asset.filename)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Guidelines */}
          <div className="bg-card rounded-2xl border border-border p-8 md:p-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              Diretrizes de Uso
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent text-xl">✓</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Uso Permitido</h3>
                <p className="text-sm text-muted-foreground">
                  Materiais do curso, Instagram, site oficial e aulas do Método IA Real.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-destructive text-xl">✕</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Não Permitido</h3>
                <p className="text-sm text-muted-foreground">
                  Revenda, uso comercial externo ou modificação sem autorização.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary text-xl">★</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Identidade</h3>
                <p className="text-sm text-muted-foreground">
                  Mantenha a paleta de cores e estética original para consistência.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Downloads;
