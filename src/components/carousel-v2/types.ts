// ==========================================
// CAROUSEL ENGINE vNext - TYPES
// ==========================================

export type CarouselObjective = 'educar' | 'converter' | 'autoridade' | 'viral' | 'storytelling' | 'polemica' | 'mito-realidade' | 'antes-depois' | 'thread-visual';
export type AudienceLevel = 'iniciante' | 'intermediario' | 'avancado';
export type VisualStyle = 'minimal-premium' | 'editorial' | 'tech-clean' | 'cozy' | 'alto-contraste';
export type ToneStyle = 'humano' | 'tecnico' | 'provocativo' | 'elegante';
export type SlideType = 'cover' | 'intro' | 'content' | 'summary' | 'cta';

export interface CarouselConfig {
  objective: CarouselObjective;
  audience: {
    level: AudienceLevel;
    niche: string;
    tone: ToneStyle;
  };
  format: {
    width: number;
    height: number;
    slideCount: number;
    style: VisualStyle;
  };
}

export interface IdeaRanking {
  id: string;
  title: string;
  score: number;
  factors: {
    curiosidade: number;
    clareza: number;
    relevancia: number;
    potencialSalvamento: number;
    potencialCompartilhamento: number;
    potencialComentario: number;
  };
  reasoning: string;
}

export interface HookOption {
  id: string;
  text: string;
  type: 'curiosidade' | 'contraste' | 'erro-comum' | 'promessa' | 'provocacao';
  score: number;
  legibilityScore: number;
}

export type ImageFilter = 'none' | 'grayscale' | 'sepia' | 'warm' | 'cool' | 'vintage' | 'dramatic';

export interface CarouselSlide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  icon?: string;
  order: number;
  imageUrl?: string;
  imagePrompt?: string;
  isGeneratingImage?: boolean;
  clarityScore?: number;
  characterCount?: number;
  // Visual controls (#15-18)
  titleFontSize?: number;       // 30-100, default varies by type
  contentFontSize?: number;     // 20-50, default ~32
  imageOpacity?: number;        // 0-100, default 45
  imageFilter?: ImageFilter;    // default 'none'
  customTextColor?: string;     // override theme text color
  customAccentColor?: string;   // override theme accent color
  // #28 Layout alternatives
  textAlignment?: 'left' | 'center' | 'right';
  textPosition?: 'top' | 'center' | 'bottom';
  // #20 Stickers / decorative elements
  stickers?: SlideSticker[];
  // #14 Draggable text positioning (percentage 0-100)
  textX?: number;
  textY?: number;
  // #21 Background image repositioning
  backgroundPositionX?: number; // percentage 0-100, default 50
  backgroundPositionY?: number; // percentage 0-100, default 50
  // #19 Multiple images per slide
  secondaryImageUrl?: string;
  secondaryImageOpacity?: number;
  // #13 Layer ordering
  layerOrder?: ('background' | 'text' | 'stickers' | 'icon')[];
}

export interface SlideSticker {
  id: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // px 24-80
  rotation: number; // degrees
}

// #30 Format dimensions
export type CarouselFormat = '4:5' | '9:16';

export const FORMAT_DIMENSIONS: Record<CarouselFormat, { width: number; height: number; label: string }> = {
  '4:5': { width: 1080, height: 1350, label: 'Feed (4:5)' },
  '9:16': { width: 1080, height: 1920, label: 'Stories (9:16)' },
};

export interface CarouselTheme {
  id: string;
  name: string;
  displayName: string;
  category: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundGradient: string;
  fontFamily: string;
}

export interface QualityScore {
  total: number;
  legibilidade: number;
  densidadeTexto: number;
  coerenciaNarrativa: number;
  consistenciaVisual: number;
  ctaClaro: number;
  issues: QualityIssue[];
}

export interface QualityIssue {
  id: string;
  slideIndex?: number;
  type: 'warning' | 'error';
  message: string;
  suggestion: string;
  action: 'encurtar' | 'contraste' | 'hook' | 'cta' | 'simplificar';
}

export interface CarouselData {
  id: string;
  topic: string;
  config: CarouselConfig;
  slides: CarouselSlide[];
  theme: CarouselTheme;
  qualityScore?: QualityScore;
  ideas?: IdeaRanking[];
  hooks?: HookOption[];
  createdAt: Date;
  caption?: string;
  hashtags?: string[];
  alternativeTitle?: string;
  firstComment?: string;
}

export type GenerationStatus = 
  | 'idle' 
  | 'generating-ideas' 
  | 'generating-hooks' 
  | 'generating-script' 
  | 'generating-copy' 
  | 'generating-images' 
  | 'quality-check' 
  | 'complete';

export interface GenerationProgress {
  status: GenerationStatus;
  currentSlide: number;
  totalSlides: number;
  message: string;
  percentage: number;
}

// ==========================================
// THEMES LIBRARY - Premium Collection
// ==========================================

export const CAROUSEL_THEMES: CarouselTheme[] = [
  // === MINIMAL PREMIUM ===
  {
    id: 'minimal-dark',
    name: 'minimal-dark',
    displayName: 'Minimal Noite',
    category: 'minimal-premium',
    primaryColor: 'hsl(225, 55%, 8%)',
    secondaryColor: 'hsl(225, 50%, 14%)',
    accentColor: 'hsl(45, 85%, 58%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(165deg, hsl(225, 55%, 8%) 0%, hsl(230, 50%, 12%) 50%, hsl(220, 55%, 10%) 100%)',
    fontFamily: "'DM Sans', sans-serif",
  },
  {
    id: 'minimal-cream',
    name: 'minimal-cream',
    displayName: 'Minimal Creme',
    category: 'minimal-premium',
    primaryColor: 'hsl(42, 35%, 96%)',
    secondaryColor: 'hsl(42, 30%, 92%)',
    accentColor: 'hsl(225, 65%, 28%)',
    textColor: 'hsl(225, 45%, 12%)',
    backgroundGradient: 'linear-gradient(180deg, hsl(42, 35%, 97%) 0%, hsl(42, 30%, 94%) 100%)',
    fontFamily: "'Playfair Display', serif",
  },
  
  // === LUXURY (NEW) ===
  {
    id: 'luxury-gold',
    name: 'luxury-gold',
    displayName: 'Luxury Gold',
    category: 'luxury',
    primaryColor: 'hsl(35, 20%, 8%)',
    secondaryColor: 'hsl(35, 18%, 14%)',
    accentColor: 'hsl(43, 90%, 55%)',
    textColor: 'hsl(45, 25%, 98%)',
    backgroundGradient: 'linear-gradient(155deg, hsl(35, 22%, 6%) 0%, hsl(38, 20%, 11%) 50%, hsl(32, 25%, 9%) 100%)',
    fontFamily: "'Playfair Display', serif",
  },
  {
    id: 'luxury-champagne',
    name: 'luxury-champagne',
    displayName: 'Luxury Champagne',
    category: 'luxury',
    primaryColor: 'hsl(40, 8%, 92%)',
    secondaryColor: 'hsl(40, 6%, 88%)',
    accentColor: 'hsl(35, 70%, 35%)',
    textColor: 'hsl(35, 30%, 12%)',
    backgroundGradient: 'linear-gradient(175deg, hsl(40, 10%, 94%) 0%, hsl(42, 8%, 90%) 100%)',
    fontFamily: "'Cormorant Garamond', serif",
  },
  {
    id: 'luxury-platinum',
    name: 'luxury-platinum',
    displayName: 'Luxury Platinum',
    category: 'luxury',
    primaryColor: 'hsl(220, 8%, 12%)',
    secondaryColor: 'hsl(220, 6%, 18%)',
    accentColor: 'hsl(45, 15%, 75%)',
    textColor: 'hsl(0, 0%, 98%)',
    backgroundGradient: 'linear-gradient(165deg, hsl(220, 10%, 10%) 0%, hsl(215, 8%, 16%) 100%)',
    fontFamily: "'DM Sans', sans-serif",
  },
  
  // === CORPORATE (NEW) ===
  {
    id: 'corporate-blue',
    name: 'corporate-blue',
    displayName: 'Corporate Blue',
    category: 'corporate',
    primaryColor: 'hsl(215, 70%, 12%)',
    secondaryColor: 'hsl(215, 65%, 18%)',
    accentColor: 'hsl(200, 90%, 50%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(160deg, hsl(215, 72%, 10%) 0%, hsl(218, 68%, 16%) 50%, hsl(212, 75%, 12%) 100%)',
    fontFamily: "'Inter', sans-serif",
  },
  {
    id: 'corporate-navy',
    name: 'corporate-navy',
    displayName: 'Corporate Navy',
    category: 'corporate',
    primaryColor: 'hsl(222, 47%, 11%)',
    secondaryColor: 'hsl(222, 45%, 17%)',
    accentColor: 'hsl(38, 92%, 50%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(155deg, hsl(222, 50%, 9%) 0%, hsl(225, 48%, 14%) 100%)',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  {
    id: 'corporate-slate',
    name: 'corporate-slate',
    displayName: 'Corporate Slate',
    category: 'corporate',
    primaryColor: 'hsl(215, 25%, 27%)',
    secondaryColor: 'hsl(215, 22%, 35%)',
    accentColor: 'hsl(170, 70%, 45%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(170deg, hsl(215, 28%, 24%) 0%, hsl(212, 25%, 32%) 100%)',
    fontFamily: "'DM Sans', sans-serif",
  },
  
  // === NATURE (NEW) ===
  {
    id: 'nature-forest',
    name: 'nature-forest',
    displayName: 'Nature Forest',
    category: 'nature',
    primaryColor: 'hsl(150, 35%, 12%)',
    secondaryColor: 'hsl(150, 30%, 18%)',
    accentColor: 'hsl(85, 70%, 55%)',
    textColor: 'hsl(0, 0%, 98%)',
    backgroundGradient: 'linear-gradient(165deg, hsl(150, 38%, 10%) 0%, hsl(155, 32%, 16%) 50%, hsl(148, 40%, 12%) 100%)',
    fontFamily: "'Nunito', sans-serif",
  },
  {
    id: 'nature-ocean',
    name: 'nature-ocean',
    displayName: 'Nature Ocean',
    category: 'nature',
    primaryColor: 'hsl(195, 50%, 12%)',
    secondaryColor: 'hsl(195, 45%, 18%)',
    accentColor: 'hsl(175, 80%, 50%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(170deg, hsl(195, 55%, 10%) 0%, hsl(198, 48%, 16%) 100%)',
    fontFamily: "'Quicksand', sans-serif",
  },
  {
    id: 'nature-earth',
    name: 'nature-earth',
    displayName: 'Nature Earth',
    category: 'nature',
    primaryColor: 'hsl(25, 35%, 15%)',
    secondaryColor: 'hsl(25, 30%, 22%)',
    accentColor: 'hsl(42, 85%, 55%)',
    textColor: 'hsl(40, 20%, 96%)',
    backgroundGradient: 'linear-gradient(165deg, hsl(25, 38%, 13%) 0%, hsl(28, 32%, 20%) 100%)',
    fontFamily: "'DM Sans', sans-serif",
  },
  
  // === EDITORIAL ===
  {
    id: 'editorial-bold',
    name: 'editorial-bold',
    displayName: 'Editorial Noir',
    category: 'editorial',
    primaryColor: 'hsl(0, 0%, 4%)',
    secondaryColor: 'hsl(0, 0%, 10%)',
    accentColor: 'hsl(4, 90%, 58%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(160deg, hsl(0, 0%, 4%) 0%, hsl(0, 0%, 9%) 50%, hsl(0, 0%, 6%) 100%)',
    fontFamily: "'Bebas Neue', sans-serif",
  },
  {
    id: 'editorial-sage',
    name: 'editorial-sage',
    displayName: 'Editorial Sage',
    category: 'editorial',
    primaryColor: 'hsl(145, 22%, 18%)',
    secondaryColor: 'hsl(145, 20%, 25%)',
    accentColor: 'hsl(48, 95%, 62%)',
    textColor: 'hsl(0, 0%, 98%)',
    backgroundGradient: 'linear-gradient(170deg, hsl(145, 22%, 17%) 0%, hsl(148, 20%, 23%) 100%)',
    fontFamily: "'Cormorant Garamond', serif",
  },
  
  // === TECH CLEAN ===
  {
    id: 'tech-blue',
    name: 'tech-blue',
    displayName: 'Tech Ocean',
    category: 'tech-clean',
    primaryColor: 'hsl(218, 55%, 8%)',
    secondaryColor: 'hsl(218, 50%, 14%)',
    accentColor: 'hsl(195, 100%, 55%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(145deg, hsl(218, 55%, 8%) 0%, hsl(222, 52%, 13%) 50%, hsl(215, 58%, 10%) 100%)',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  {
    id: 'tech-purple',
    name: 'tech-purple',
    displayName: 'Tech Aurora',
    category: 'tech-clean',
    primaryColor: 'hsl(268, 55%, 10%)',
    secondaryColor: 'hsl(262, 50%, 16%)',
    accentColor: 'hsl(275, 85%, 68%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(155deg, hsl(268, 55%, 10%) 0%, hsl(265, 50%, 15%) 50%, hsl(270, 58%, 12%) 100%)',
    fontFamily: "'Inter', sans-serif",
  },
  
  // === COZY ===
  {
    id: 'cozy-warm',
    name: 'cozy-warm',
    displayName: 'Cozy Amber',
    category: 'cozy',
    primaryColor: 'hsl(28, 40%, 13%)',
    secondaryColor: 'hsl(28, 35%, 20%)',
    accentColor: 'hsl(38, 95%, 58%)',
    textColor: 'hsl(42, 25%, 96%)',
    backgroundGradient: 'linear-gradient(175deg, hsl(28, 40%, 12%) 0%, hsl(26, 38%, 18%) 100%)',
    fontFamily: "'Nunito', sans-serif",
  },
  {
    id: 'cozy-blush',
    name: 'cozy-blush',
    displayName: 'Cozy Rosé',
    category: 'cozy',
    primaryColor: 'hsl(348, 25%, 16%)',
    secondaryColor: 'hsl(348, 22%, 23%)',
    accentColor: 'hsl(348, 78%, 72%)',
    textColor: 'hsl(0, 0%, 98%)',
    backgroundGradient: 'linear-gradient(168deg, hsl(348, 25%, 15%) 0%, hsl(345, 23%, 21%) 100%)',
    fontFamily: "'Quicksand', sans-serif",
  },
  
  // === ALTO CONTRASTE ===
  {
    id: 'contrast-bw',
    name: 'contrast-bw',
    displayName: 'Contraste Puro',
    category: 'alto-contraste',
    primaryColor: 'hsl(0, 0%, 2%)',
    secondaryColor: 'hsl(0, 0%, 7%)',
    accentColor: 'hsl(0, 0%, 100%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(180deg, hsl(0, 0%, 2%) 0%, hsl(0, 0%, 6%) 100%)',
    fontFamily: "'Bebas Neue', sans-serif",
  },
  {
    id: 'contrast-neon',
    name: 'contrast-neon',
    displayName: 'Neon Cyber',
    category: 'alto-contraste',
    primaryColor: 'hsl(265, 65%, 7%)',
    secondaryColor: 'hsl(265, 58%, 11%)',
    accentColor: 'hsl(165, 100%, 48%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(150deg, hsl(265, 65%, 6%) 0%, hsl(268, 58%, 10%) 50%, hsl(262, 62%, 8%) 100%)',
    fontFamily: "'Orbitron', sans-serif",
  },
];

// ==========================================
// TEMPLATE LIBRARY
// ==========================================

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  themeId: string;
  structure: SlideType[];
  features: string[];
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  // === EDUCACIONAL ===
  {
    id: 'educacional-clean',
    name: 'Educacional Clean',
    description: 'Perfeito para ensinar conceitos passo a passo',
    category: 'Educacional',
    themeId: 'minimal-dark',
    structure: ['cover', 'intro', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Didático', 'Passo a passo', 'Claro'],
  },
  {
    id: 'educacional-visual',
    name: 'Aula Visual',
    description: 'Conteúdo educativo com foco em imagens e diagramas',
    category: 'Educacional',
    themeId: 'tech-blue',
    structure: ['cover', 'content', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Visual', 'Diagrama', 'Imersivo'],
  },
  {
    id: 'educacional-micro',
    name: 'Micro-Aula',
    description: 'Conteúdo curto e direto, ideal para dicas rápidas',
    category: 'Educacional',
    themeId: 'minimal-cream',
    structure: ['cover', 'content', 'content', 'content', 'cta'],
    features: ['Rápido', 'Direto', 'Dicas'],
  },
  {
    id: 'educacional-glossario',
    name: 'Glossário / Definições',
    description: 'Explique termos e conceitos do seu nicho',
    category: 'Educacional',
    themeId: 'corporate-slate',
    structure: ['cover', 'content', 'content', 'content', 'content', 'content', 'cta'],
    features: ['Termos', 'Definições', 'Referência'],
  },

  // === VIRAL ===
  {
    id: 'lista-viral',
    name: 'Lista Viral',
    description: 'Formato de lista que maximiza saves e shares',
    category: 'Viral',
    themeId: 'tech-blue',
    structure: ['cover', 'content', 'content', 'content', 'content', 'content', 'cta'],
    features: ['Números', 'Rápido', 'Compartilhável'],
  },
  {
    id: '7-erros',
    name: '7 Erros Comuns',
    description: 'Lista de erros que gera identificação',
    category: 'Viral',
    themeId: 'contrast-bw',
    structure: ['cover', 'content', 'content', 'content', 'content', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Polêmico', 'Educativo', 'Viral'],
  },
  {
    id: 'mitos-verdades',
    name: 'Mitos vs Verdades',
    description: 'Desmistifique crenças do seu nicho',
    category: 'Viral',
    themeId: 'editorial-bold',
    structure: ['cover', 'content', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Polêmico', 'Compartilhável', 'Debate'],
  },
  {
    id: 'top-ferramentas',
    name: 'Top Ferramentas',
    description: 'Recomendações de ferramentas e recursos',
    category: 'Viral',
    themeId: 'tech-purple',
    structure: ['cover', 'content', 'content', 'content', 'content', 'content', 'cta'],
    features: ['Útil', 'Salvável', 'Prático'],
  },

  // === AUTORIDADE ===
  {
    id: 'framework-5-passos',
    name: 'Framework 5 Passos',
    description: 'Estrutura de framework com método claro',
    category: 'Autoridade',
    themeId: 'editorial-bold',
    structure: ['cover', 'intro', 'content', 'content', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Framework', 'Método', 'Autoridade'],
  },
  {
    id: 'case-study',
    name: 'Estudo de Caso',
    description: 'Mostre resultados reais de clientes ou projetos',
    category: 'Autoridade',
    themeId: 'luxury-gold',
    structure: ['cover', 'intro', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Prova', 'Resultados', 'Credibilidade'],
  },
  {
    id: 'opiniao-expert',
    name: 'Opinião de Expert',
    description: 'Posicionamento forte sobre tema do nicho',
    category: 'Autoridade',
    themeId: 'luxury-platinum',
    structure: ['cover', 'intro', 'content', 'content', 'content', 'content', 'cta'],
    features: ['Opinião', 'Polêmico', 'Posicionamento'],
  },

  // === CONVERSÃO ===
  {
    id: 'antes-depois',
    name: 'Antes e Depois',
    description: 'Contraste de transformação',
    category: 'Conversão',
    themeId: 'cozy-warm',
    structure: ['cover', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Transformação', 'Prova', 'Conversão'],
  },
  {
    id: 'problema-solucao',
    name: 'Problema → Solução',
    description: 'Identifique a dor e apresente a solução',
    category: 'Conversão',
    themeId: 'corporate-blue',
    structure: ['cover', 'content', 'content', 'content', 'cta'],
    features: ['Dor', 'Solução', 'Oferta'],
  },
  {
    id: 'depoimento-social',
    name: 'Prova Social',
    description: 'Depoimentos e resultados de clientes',
    category: 'Conversão',
    themeId: 'luxury-champagne',
    structure: ['cover', 'content', 'content', 'content', 'content', 'cta'],
    features: ['Depoimento', 'Social Proof', 'Trust'],
  },

  // === STORYTELLING ===
  {
    id: 'storytelling-pessoal',
    name: 'Storytelling Pessoal',
    description: 'Narrativa de história real',
    category: 'Storytelling',
    themeId: 'editorial-sage',
    structure: ['cover', 'intro', 'content', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Emocional', 'Conexão', 'Autêntico'],
  },
  {
    id: 'jornada-heroi',
    name: 'Jornada do Herói',
    description: 'Conta a trajetória de superação',
    category: 'Storytelling',
    themeId: 'nature-forest',
    structure: ['cover', 'intro', 'content', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Inspirador', 'Jornada', 'Superação'],
  },
  {
    id: 'bastidores',
    name: 'Bastidores / Behind the Scenes',
    description: 'Mostre os bastidores do seu trabalho',
    category: 'Storytelling',
    themeId: 'cozy-blush',
    structure: ['cover', 'content', 'content', 'content', 'content', 'cta'],
    features: ['Autêntico', 'Humanizado', 'Conexão'],
  },

  // === EDITORIAL BOLD (#24) ===
  {
    id: 'editorial-manifesto',
    name: 'Manifesto Bold',
    description: 'Estilo @brandsdecoded com tipografia impactante',
    category: 'Editorial',
    themeId: 'editorial-bold',
    structure: ['cover', 'content', 'content', 'content', 'content', 'cta'],
    features: ['Bold', 'Tipografia', 'Impactante'],
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Layout estilo revista com blocos de texto elegantes',
    category: 'Editorial',
    themeId: 'editorial-sage',
    structure: ['cover', 'intro', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Elegante', 'Magazine', 'Sofisticado'],
  },
  {
    id: 'editorial-contraste',
    name: 'Contraste Extremo',
    description: 'Preto e branco com acento de cor para máximo impacto',
    category: 'Editorial',
    themeId: 'contrast-bw',
    structure: ['cover', 'content', 'content', 'content', 'content', 'cta'],
    features: ['P&B', 'Contraste', 'Minimalista'],
  },
  {
    id: 'editorial-neon',
    name: 'Neon Futurista',
    description: 'Estilo cyberpunk com cores vibrantes',
    category: 'Editorial',
    themeId: 'contrast-neon',
    structure: ['cover', 'content', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Neon', 'Futurista', 'Tech'],
  },

  // === #25 PERSON CUTOUT ===
  {
    id: 'person-cutout',
    name: 'Pessoa + Texto',
    description: 'Recorte de pessoa com texto sobreposto em destaque',
    category: 'Editorial',
    themeId: 'editorial-bold',
    structure: ['cover', 'content', 'content', 'content', 'cta'],
    features: ['Pessoa', 'Recorte', 'Impacto'],
  },
  {
    id: 'speaker-quote',
    name: 'Speaker Quote',
    description: 'Foto de pessoa com citação sobreposta estilo palestra',
    category: 'Editorial',
    themeId: 'luxury-platinum',
    structure: ['cover', 'content', 'content', 'content', 'cta'],
    features: ['Quote', 'Speaker', 'Autoridade'],
  },

  // === NICHO ESPECÍFICO ===
  {
    id: 'receita-passo',
    name: 'Receita / Tutorial',
    description: 'Passo a passo visual para receitas ou tutoriais',
    category: 'Nicho',
    themeId: 'cozy-warm',
    structure: ['cover', 'content', 'content', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Passo a passo', 'Visual', 'Prático'],
  },
  {
    id: 'checklist',
    name: 'Checklist Salvável',
    description: 'Lista de verificação que o público vai salvar',
    category: 'Nicho',
    themeId: 'nature-ocean',
    structure: ['cover', 'content', 'content', 'content', 'content', 'cta'],
    features: ['Checklist', 'Salvável', 'Organizado'],
  },
  {
    id: 'comparativo',
    name: 'Comparativo A vs B',
    description: 'Compare duas opções lado a lado',
    category: 'Nicho',
    themeId: 'corporate-navy',
    structure: ['cover', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Comparação', 'Análise', 'Decisão'],
  },
  {
    id: 'dados-estatisticas',
    name: 'Dados & Estatísticas',
    description: 'Apresente dados e números de impacto',
    category: 'Nicho',
    themeId: 'luxury-platinum',
    structure: ['cover', 'content', 'content', 'content', 'content', 'cta'],
    features: ['Dados', 'Números', 'Impacto'],
  },
];

// ==========================================
// ICONS
// ==========================================

export const CONTENT_ICONS = [
  'Lightbulb', 'Target', 'Rocket', 'TrendingUp', 'Zap', 'Star', 'Award', 'CheckCircle',
  'ArrowRight', 'Brain', 'Cpu', 'MessageSquare', 'Users', 'BarChart', 'Sparkles', 'Shield',
  'Clock', 'Settings', 'Layers', 'BookOpen', 'Compass', 'Flag', 'Heart', 'Puzzle',
  'Eye', 'Lock', 'Unlock', 'DollarSign', 'Percent', 'Calendar', 'Bell', 'Gift'
];

// ==========================================
// OBJECTIVE CONFIGS
// ==========================================

export const OBJECTIVE_CONFIGS: Record<CarouselObjective, {
  label: string;
  description: string;
  icon: string;
  structure: string;
  color: string;
}> = {
  educar: {
    label: 'Educar',
    description: 'Ensinar algo novo de forma clara',
    icon: 'BookOpen',
    structure: 'Hook → Contexto → 3-5 Insights → Resumo → CTA',
    color: 'hsl(200, 95%, 55%)',
  },
  converter: {
    label: 'Converter',
    description: 'Gerar vendas ou leads',
    icon: 'Target',
    structure: 'Dor → Prova → Solução → Oferta → CTA',
    color: 'hsl(140, 70%, 45%)',
  },
  autoridade: {
    label: 'Autoridade',
    description: 'Posicionar como especialista',
    icon: 'Award',
    structure: 'Verdade Contraintuitiva → Framework → Prova → CTA',
    color: 'hsl(45, 90%, 55%)',
  },
  viral: {
    label: 'Viral',
    description: 'Maximizar saves e compartilhamentos',
    icon: 'Zap',
    structure: 'Hook Forte → Microvitórias → Lista → Twist → CTA',
    color: 'hsl(280, 80%, 60%)',
  },
  storytelling: {
    label: 'Storytelling',
    description: 'Contar uma história real e inspiradora',
    icon: 'Heart',
    structure: 'Situação → Conflito → Jornada → Resolução → Lição → CTA',
    color: 'hsl(350, 70%, 60%)',
  },
  polemica: {
    label: 'Polêmica Saudável',
    description: 'Opinião forte que gera debate',
    icon: 'MessageSquare',
    structure: 'Afirmação Forte → Contexto → Argumentos → Convite ao Debate',
    color: 'hsl(20, 90%, 55%)',
  },
  'mito-realidade': {
    label: 'Mito vs Realidade',
    description: 'Desmistifique crenças populares',
    icon: 'Users',
    structure: 'Cover → Mito 1 → Realidade 1 → Mito 2 → Realidade 2 → Conclusão → CTA',
    color: 'hsl(260, 75%, 55%)',
  },
  'antes-depois': {
    label: 'Antes e Depois',
    description: 'Mostre transformações e resultados',
    icon: 'Zap',
    structure: 'Cover → Antes (Problema) → Depois (Resultado) → Como → Prova → CTA',
    color: 'hsl(160, 70%, 45%)',
  },
  'thread-visual': {
    label: 'Thread Visual',
    description: 'Estilo tweet/thread com insights rápidos',
    icon: 'MessageSquare',
    structure: 'Cover → Insight 1 → Insight 2 → Insight 3 → Insight 4 → Resumo → CTA',
    color: 'hsl(210, 85%, 55%)',
  },
};

// ==========================================
// GOOGLE FONTS (#22)
// ==========================================

export const GOOGLE_FONTS = [
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", category: 'Sans-serif' },
  { name: 'DM Sans', family: "'DM Sans', sans-serif", category: 'Sans-serif' },
  { name: 'Inter', family: "'Inter', sans-serif", category: 'Sans-serif' },
  { name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", category: 'Sans-serif' },
  { name: 'Nunito', family: "'Nunito', sans-serif", category: 'Sans-serif' },
  { name: 'Quicksand', family: "'Quicksand', sans-serif", category: 'Sans-serif' },
  { name: 'Poppins', family: "'Poppins', sans-serif", category: 'Sans-serif' },
  { name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'Sans-serif' },
  { name: 'Raleway', family: "'Raleway', sans-serif", category: 'Sans-serif' },
  { name: 'Outfit', family: "'Outfit', sans-serif", category: 'Sans-serif' },
  { name: 'Playfair Display', family: "'Playfair Display', serif", category: 'Serif' },
  { name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", category: 'Serif' },
  { name: 'Lora', family: "'Lora', serif", category: 'Serif' },
  { name: 'Merriweather', family: "'Merriweather', serif", category: 'Serif' },
  { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'Display' },
  { name: 'Orbitron', family: "'Orbitron', sans-serif", category: 'Display' },
  { name: 'Oswald', family: "'Oswald', sans-serif", category: 'Display' },
  { name: 'Fjalla One', family: "'Fjalla One', sans-serif", category: 'Display' },
];
