import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Target, Award, Zap, Heart, MessageSquare,
  ChevronRight, ChevronLeft, Sparkles, Users, Wand2
} from 'lucide-react';
import { 
  CarouselConfig, 
  CarouselObjective, 
  AudienceLevel, 
  ToneStyle, 
  VisualStyle,
  OBJECTIVE_CONFIGS,
  CAROUSEL_THEMES
} from './types';

const iconMap: Record<string, React.ComponentType<any>> = {
  BookOpen, Target, Award, Zap, Heart, MessageSquare, Users
};

interface CarouselWizardProps {
  onComplete: (config: CarouselConfig, topic: string) => void;
  isGenerating?: boolean;
}

export const CarouselWizard = ({ onComplete, isGenerating }: CarouselWizardProps) => {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [config, setConfig] = useState<CarouselConfig>({
    objective: 'educar',
    audience: {
      level: 'intermediario',
      niche: '',
      tone: 'humano',
    },
    format: {
      width: 1080,
      height: 1350,
      slideCount: 7,
      style: 'minimal-premium',
    },
  });

  const objectives: { key: CarouselObjective; config: typeof OBJECTIVE_CONFIGS['educar'] }[] = 
    Object.entries(OBJECTIVE_CONFIGS).map(([key, value]) => ({
      key: key as CarouselObjective,
      config: value,
    }));

  const audienceLevels: { key: AudienceLevel; label: string; desc: string }[] = [
    { key: 'iniciante', label: 'Iniciante', desc: 'Pessoas que estão começando' },
    { key: 'intermediario', label: 'Intermediário', desc: 'Já tem conhecimento básico' },
    { key: 'avancado', label: 'Avançado', desc: 'Especialistas buscando profundidade' },
  ];

  const tones: { key: ToneStyle; label: string; desc: string }[] = [
    { key: 'humano', label: 'Humano', desc: 'Próximo e acessível' },
    { key: 'tecnico', label: 'Técnico', desc: 'Preciso e profissional' },
    { key: 'provocativo', label: 'Provocativo', desc: 'Desafiador e ousado' },
    { key: 'elegante', label: 'Elegante', desc: 'Sofisticado e premium' },
  ];

  const visualStyles: { key: VisualStyle; label: string; themes: string[] }[] = [
    { key: 'minimal-premium', label: 'Minimal Premium', themes: ['minimal-dark', 'minimal-cream'] },
    { key: 'editorial', label: 'Editorial', themes: ['editorial-bold', 'editorial-sage'] },
    { key: 'tech-clean', label: 'Tech Clean', themes: ['tech-blue', 'tech-purple'] },
    { key: 'cozy', label: 'Cozy Moderno', themes: ['cozy-warm', 'cozy-blush'] },
    { key: 'alto-contraste', label: 'Alto Contraste', themes: ['contrast-bw', 'contrast-neon'] },
  ];

  const slideCounts = [5, 6, 7, 8, 9, 10];

  const handleComplete = () => {
    if (!topic.trim()) return;
    onComplete(config, topic);
  };

  const canProceed = () => {
    if (step === 4) return topic.trim().length > 0;
    return true;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                s === step 
                  ? 'bg-accent text-accent-foreground scale-110' 
                  : s < step 
                    ? 'bg-accent/30 text-accent' 
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div className={`w-16 h-1 mx-2 rounded ${
                s < step ? 'bg-accent/50' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Objetivo */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Qual é o objetivo do carrossel?</h2>
              <p className="text-muted-foreground">Escolha o que você quer alcançar</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {objectives.map(({ key, config: objConfig }) => {
                const Icon = iconMap[objConfig.icon] || Sparkles;
                const isSelected = config.objective === key;
                
                return (
                  <Card
                    key={key}
                    className={`p-5 cursor-pointer transition-all hover:scale-[1.02] ${
                      isSelected 
                        ? 'ring-2 ring-accent bg-accent/10' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setConfig(prev => ({ ...prev, objective: key }))}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${objConfig.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: objConfig.color }} />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{objConfig.label}</h3>
                    <p className="text-sm text-muted-foreground">{objConfig.description}</p>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Público */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Para quem é esse conteúdo?</h2>
              <p className="text-muted-foreground">Defina seu público e tom</p>
            </div>

            {/* Nível */}
            <div>
              <Label className="text-lg mb-4 block">Nível do público</Label>
              <div className="grid grid-cols-3 gap-3">
                {audienceLevels.map(({ key, label, desc }) => (
                  <Card
                    key={key}
                    className={`p-4 cursor-pointer transition-all ${
                      config.audience.level === key 
                        ? 'ring-2 ring-accent bg-accent/10' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      audience: { ...prev.audience, level: key } 
                    }))}
                  >
                    <h4 className="font-semibold">{label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Nicho */}
            <div>
              <Label htmlFor="niche" className="text-lg mb-2 block">Nicho (opcional)</Label>
              <Input
                id="niche"
                placeholder="Ex: Empreendedores digitais, Designers, Profissionais de marketing..."
                value={config.audience.niche}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  audience: { ...prev.audience, niche: e.target.value } 
                }))}
                className="text-lg py-6"
              />
            </div>

            {/* Tom */}
            <div>
              <Label className="text-lg mb-4 block">Tom de voz</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tones.map(({ key, label, desc }) => (
                  <Card
                    key={key}
                    className={`p-4 cursor-pointer transition-all ${
                      config.audience.tone === key 
                        ? 'ring-2 ring-accent bg-accent/10' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      audience: { ...prev.audience, tone: key } 
                    }))}
                  >
                    <h4 className="font-semibold">{label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Formato */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Formato e estilo visual</h2>
              <p className="text-muted-foreground">Escolha a aparência do carrossel</p>
            </div>

            {/* Quantidade de slides */}
            <div>
              <Label className="text-lg mb-4 block">Quantidade de slides</Label>
              <div className="flex gap-2 flex-wrap">
                {slideCounts.map((count) => (
                  <Button
                    key={count}
                    variant={config.format.slideCount === count ? 'default' : 'outline'}
                    className={`w-14 h-14 text-lg ${
                      config.format.slideCount === count ? 'bg-accent hover:bg-accent/90' : ''
                    }`}
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      format: { ...prev.format, slideCount: count } 
                    }))}
                  >
                    {count}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Recomendado: 7 slides para equilíbrio ideal
              </p>
            </div>

            {/* Estilo visual */}
            <div>
              <Label className="text-lg mb-4 block">Estilo visual</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visualStyles.map(({ key, label, themes }) => {
                  const previewTheme = CAROUSEL_THEMES.find(t => t.id === themes[0]);
                  const isSelected = config.format.style === key;
                  
                  return (
                    <Card
                      key={key}
                      className={`p-4 cursor-pointer transition-all overflow-hidden ${
                        isSelected 
                          ? 'ring-2 ring-accent' 
                          : 'hover:ring-1 hover:ring-muted-foreground/30'
                      }`}
                      onClick={() => setConfig(prev => ({ 
                        ...prev, 
                        format: { ...prev.format, style: key } 
                      }))}
                    >
                      {/* Theme Preview */}
                      <div 
                        className="h-24 rounded-lg mb-3 flex items-center justify-center"
                        style={{ background: previewTheme?.backgroundGradient }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ background: previewTheme?.accentColor }}
                        />
                      </div>
                      <h4 className="font-semibold">{label}</h4>
                      <div className="flex gap-1 mt-2">
                        {themes.map(themeId => {
                          const t = CAROUSEL_THEMES.find(th => th.id === themeId);
                          return t && (
                            <div
                              key={themeId}
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ background: t.accentColor }}
                            />
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Tema e Gerar */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Sobre o que é o carrossel?</h2>
              <p className="text-muted-foreground">Descreva o tema principal</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <textarea
                placeholder="Ex: 5 ferramentas de IA que todo empreendedor precisa conhecer em 2024"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full min-h-[150px] p-6 text-xl bg-background border border-border rounded-xl resize-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Seja específico para melhores resultados
              </p>
            </div>

            {/* Config Summary */}
            <Card className="p-6 bg-muted/30 max-w-2xl mx-auto">
              <h4 className="font-semibold mb-4">Resumo da configuração</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Objetivo</p>
                  <p className="font-medium capitalize">{OBJECTIVE_CONFIGS[config.objective].label}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Público</p>
                  <p className="font-medium capitalize">{config.audience.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tom</p>
                  <p className="font-medium capitalize">{config.audience.tone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Slides</p>
                  <p className="font-medium">{config.format.slideCount} slides</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => setStep(Math.min(4, step + 1))}
            disabled={!canProceed()}
            className="gap-2 bg-accent hover:bg-accent/90"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canProceed() || isGenerating}
            className="gap-2 bg-accent hover:bg-accent/90 px-8"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-4 h-4 animate-pulse" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Carrossel
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
