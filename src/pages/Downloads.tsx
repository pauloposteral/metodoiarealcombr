import { Helmet } from "react-helmet-async";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopHeader } from "@/components/TopHeader";
import { Footer } from "@/components/Footer";

// Character images
import mentorGuiding from "@/assets/character/mentor-guiding.png";
import mentorThinking from "@/assets/character/mentor-thinking.png";
import mentorExplaining from "@/assets/character/mentor-explaining.png";
import mentorInteracting from "@/assets/character/mentor-interacting.png";
import mentorPortrait from "@/assets/character/mentor-portrait.png";

const characterAssets = [
  {
    id: "guiding",
    name: "Mentor Guiando",
    description: "Pose apontando e guiando, ideal para CTAs e direcionamentos",
    image: mentorGuiding,
    filename: "mentor-guiding.png",
  },
  {
    id: "thinking",
    name: "Mentor Pensando",
    description: "Pose reflexiva, perfeita para seções de análise e estratégia",
    image: mentorThinking,
    filename: "mentor-thinking.png",
  },
  {
    id: "explaining",
    name: "Mentor Explicando",
    description: "Pose didática com mãos abertas, ideal para conteúdo educacional",
    image: mentorExplaining,
    filename: "mentor-explaining.png",
  },
  {
    id: "interacting",
    name: "Mentor Interagindo",
    description: "Interação com elementos visuais e diagramas holográficos",
    image: mentorInteracting,
    filename: "mentor-interacting.png",
  },
  {
    id: "portrait",
    name: "Mentor Retrato",
    description: "Portrait elegante para perfis e thumbnails",
    image: mentorPortrait,
    filename: "mentor-portrait.png",
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
        <title>Downloads - Personagem Método IA Real</title>
        <meta
          name="description"
          content="Baixe o personagem oficial do Método IA Real em diferentes poses para usar em suas campanhas e materiais."
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
              Personagem{" "}
              <span className="text-gradient-gold">Método IA Real</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conheça o mentor visual do Método IA Real. Um personagem futurístico,
              elegante e humano que representa inteligência prática, clareza e método.
            </p>
          </div>

          {/* Character Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {characterAssets.map((asset) => (
              <div
                key={asset.id}
                className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-accent/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

          {/* Usage Guidelines */}
          <div className="mt-20 bg-card rounded-2xl border border-border p-8 md:p-12">
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
