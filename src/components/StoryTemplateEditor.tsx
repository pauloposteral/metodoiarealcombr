import { useState, useRef } from "react";
import { Download, Type, Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import html2canvas from "html2canvas";
import realisStoriesWelcome from "@/assets/character/realis-stories-welcome.png";

const colorPresets = [
  { name: "Azul Profundo", bg: "from-[#0a1628] to-[#1a2d4d]", text: "#ffffff" },
  { name: "Dourado", bg: "from-[#1a1a0a] to-[#2d2a1a]", text: "#d4af37" },
  { name: "Tech Blue", bg: "from-[#0f172a] to-[#1e3a5f]", text: "#60a5fa" },
  { name: "Elegante", bg: "from-[#0a0a0a] to-[#1a1a2e]", text: "#e2e8f0" },
];

const StoryTemplateEditor = () => {
  const templateRef = useRef<HTMLDivElement>(null);
  const [topText, setTopText] = useState("Dica de IA #1");
  const [bottomText, setBottomText] = useState("Aprenda a usar ChatGPT como um profissional");
  const [ctaText, setCtaText] = useState("Saiba mais →");
  const [selectedColor, setSelectedColor] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!templateRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      
      const link = document.createElement("a");
      link.download = "realis-story-template.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error exporting:", error);
    }
    setIsExporting(false);
  };

  const resetToDefault = () => {
    setTopText("Dica de IA #1");
    setBottomText("Aprenda a usar ChatGPT como um profissional");
    setCtaText("Saiba mais →");
    setSelectedColor(0);
  };

  const currentColor = colorPresets[selectedColor];

  return (
    <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Preview */}
        <div className="flex-1 flex justify-center">
          <div
            ref={templateRef}
            className={`relative w-[270px] h-[480px] md:w-[324px] md:h-[576px] rounded-2xl overflow-hidden bg-gradient-to-b ${currentColor.bg}`}
          >
            {/* Top Text */}
            <div className="absolute top-8 left-0 right-0 text-center px-4 z-10">
              <p 
                className="font-display text-lg md:text-xl font-bold"
                style={{ color: currentColor.text }}
              >
                {topText}
              </p>
            </div>

            {/* REALIS Character */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={realisStoriesWelcome}
                alt="REALIS"
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-8 left-0 right-0 px-4 z-10">
              <p 
                className="text-center text-sm md:text-base font-medium mb-4 leading-tight"
                style={{ color: currentColor.text }}
              >
                {bottomText}
              </p>
              <div 
                className="mx-auto w-fit px-6 py-2 rounded-full font-semibold text-sm"
                style={{ 
                  backgroundColor: currentColor.text,
                  color: "#0a1628"
                }}
              >
                {ctaText}
              </div>
            </div>

            {/* Logo Watermark */}
            <div className="absolute bottom-2 right-3 opacity-60">
              <span className="text-xs font-medium" style={{ color: currentColor.text }}>
                @metodoiareal
              </span>
            </div>
          </div>
        </div>

        {/* Editor Controls */}
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-accent" />
              Editar Textos
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="topText" className="text-sm text-muted-foreground">
                  Texto Superior (Título)
                </Label>
                <Input
                  id="topText"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Ex: Dica de IA #1"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="bottomText" className="text-sm text-muted-foreground">
                  Texto Inferior (Descrição)
                </Label>
                <Input
                  id="bottomText"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Ex: Aprenda a usar ChatGPT..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="ctaText" className="text-sm text-muted-foreground">
                  Botão CTA
                </Label>
                <Input
                  id="ctaText"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Ex: Saiba mais →"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-accent" />
              Paleta de Cores
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {colorPresets.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedColor === index 
                      ? "border-accent ring-2 ring-accent/30" 
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <div 
                    className={`h-8 rounded bg-gradient-to-r ${color.bg} mb-2`}
                  />
                  <span className="text-xs text-muted-foreground">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={resetToDefault}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exportando..." : "Baixar Story"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Dimensões: 1080 x 1920 (formato Story/Reels)
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoryTemplateEditor;
