// ==========================================
// CAROUSEL ENGINE vNext - TYPES
// ==========================================

export type CarouselObjective = 'educar' | 'converter' | 'autoridade' | 'viral' | 'storytelling' | 'polemica';
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
}

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
// THEMES LIBRARY
// ==========================================

export const CAROUSEL_THEMES: CarouselTheme[] = [
  // Minimal Premium
  {
    id: 'minimal-dark',
    name: 'minimal-dark',
    displayName: 'Minimal Escuro',
    category: 'minimal-premium',
    primaryColor: 'hsl(220, 55%, 8%)',
    secondaryColor: 'hsl(220, 50%, 14%)',
    accentColor: 'hsl(43, 75%, 55%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(160deg, hsl(220, 55%, 8%) 0%, hsl(220, 50%, 14%) 100%)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'minimal-cream',
    name: 'minimal-cream',
    displayName: 'Minimal Creme',
    category: 'minimal-premium',
    primaryColor: 'hsl(40, 30%, 96%)',
    secondaryColor: 'hsl(40, 25%, 90%)',
    accentColor: 'hsl(220, 60%, 25%)',
    textColor: 'hsl(220, 40%, 15%)',
    backgroundGradient: 'linear-gradient(180deg, hsl(40, 30%, 96%) 0%, hsl(40, 25%, 92%) 100%)',
    fontFamily: "'Playfair Display', serif",
  },
  // Editorial
  {
    id: 'editorial-bold',
    name: 'editorial-bold',
    displayName: 'Editorial Bold',
    category: 'editorial',
    primaryColor: 'hsl(0, 0%, 5%)',
    secondaryColor: 'hsl(0, 0%, 12%)',
    accentColor: 'hsl(0, 85%, 55%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(135deg, hsl(0, 0%, 5%) 0%, hsl(0, 0%, 12%) 100%)',
    fontFamily: "'DM Sans', sans-serif",
  },
  {
    id: 'editorial-sage',
    name: 'editorial-sage',
    displayName: 'Editorial Sage',
    category: 'editorial',
    primaryColor: 'hsl(140, 20%, 20%)',
    secondaryColor: 'hsl(140, 18%, 28%)',
    accentColor: 'hsl(45, 90%, 65%)',
    textColor: 'hsl(0, 0%, 98%)',
    backgroundGradient: 'linear-gradient(160deg, hsl(140, 20%, 20%) 0%, hsl(140, 18%, 28%) 100%)',
    fontFamily: "'Cormorant Garamond', serif",
  },
  // Tech Clean
  {
    id: 'tech-blue',
    name: 'tech-blue',
    displayName: 'Tech Azul',
    category: 'tech-clean',
    primaryColor: 'hsl(220, 45%, 10%)',
    secondaryColor: 'hsl(220, 40%, 16%)',
    accentColor: 'hsl(200, 95%, 55%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(135deg, hsl(220, 45%, 10%) 0%, hsl(220, 40%, 16%) 100%)',
    fontFamily: "'Inter', sans-serif",
  },
  {
    id: 'tech-purple',
    name: 'tech-purple',
    displayName: 'Tech Roxo',
    category: 'tech-clean',
    primaryColor: 'hsl(270, 50%, 12%)',
    secondaryColor: 'hsl(260, 45%, 18%)',
    accentColor: 'hsl(280, 80%, 65%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(135deg, hsl(270, 50%, 12%) 0%, hsl(260, 45%, 18%) 100%)',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  // Cozy
  {
    id: 'cozy-warm',
    name: 'cozy-warm',
    displayName: 'Cozy Quente',
    category: 'cozy',
    primaryColor: 'hsl(25, 35%, 15%)',
    secondaryColor: 'hsl(25, 30%, 22%)',
    accentColor: 'hsl(35, 90%, 60%)',
    textColor: 'hsl(40, 20%, 95%)',
    backgroundGradient: 'linear-gradient(180deg, hsl(25, 35%, 15%) 0%, hsl(25, 30%, 22%) 100%)',
    fontFamily: "'Nunito', sans-serif",
  },
  {
    id: 'cozy-blush',
    name: 'cozy-blush',
    displayName: 'Cozy Blush',
    category: 'cozy',
    primaryColor: 'hsl(350, 20%, 18%)',
    secondaryColor: 'hsl(350, 18%, 25%)',
    accentColor: 'hsl(350, 70%, 70%)',
    textColor: 'hsl(0, 0%, 98%)',
    backgroundGradient: 'linear-gradient(160deg, hsl(350, 20%, 18%) 0%, hsl(350, 18%, 25%) 100%)',
    fontFamily: "'Quicksand', sans-serif",
  },
  // Alto Contraste
  {
    id: 'contrast-bw',
    name: 'contrast-bw',
    displayName: 'Alto Contraste P&B',
    category: 'alto-contraste',
    primaryColor: 'hsl(0, 0%, 0%)',
    secondaryColor: 'hsl(0, 0%, 8%)',
    accentColor: 'hsl(0, 0%, 100%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(180deg, hsl(0, 0%, 0%) 0%, hsl(0, 0%, 8%) 100%)',
    fontFamily: "'Bebas Neue', sans-serif",
  },
  {
    id: 'contrast-neon',
    name: 'contrast-neon',
    displayName: 'Neon Vibrante',
    category: 'alto-contraste',
    primaryColor: 'hsl(260, 60%, 8%)',
    secondaryColor: 'hsl(260, 55%, 12%)',
    accentColor: 'hsl(170, 100%, 50%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(135deg, hsl(260, 60%, 8%) 0%, hsl(260, 55%, 12%) 100%)',
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
    id: 'lista-viral',
    name: 'Lista Viral',
    description: 'Formato de lista que maximiza saves e shares',
    category: 'Viral',
    themeId: 'tech-blue',
    structure: ['cover', 'content', 'content', 'content', 'content', 'content', 'cta'],
    features: ['Números', 'Rápido', 'Compartilhável'],
  },
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
    id: 'antes-depois',
    name: 'Antes e Depois',
    description: 'Contraste de transformação',
    category: 'Conversão',
    themeId: 'cozy-warm',
    structure: ['cover', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Transformação', 'Prova', 'Conversão'],
  },
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
    id: '7-erros',
    name: '7 Erros Comuns',
    description: 'Lista de erros que gera identificação',
    category: 'Viral',
    themeId: 'contrast-bw',
    structure: ['cover', 'content', 'content', 'content', 'content', 'content', 'content', 'content', 'summary', 'cta'],
    features: ['Polêmico', 'Educativo', 'Viral'],
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
};
