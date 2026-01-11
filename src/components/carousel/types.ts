export type SlideType = 'cover' | 'intro' | 'content' | 'summary' | 'cta';

export interface CarouselSlide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  content?: string;
  icon?: string;
  order: number;
  imageUrl?: string;
  imagePrompt?: string;
  isGeneratingImage?: boolean;
}

export interface CarouselTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundGradient: string;
}

export interface CarouselData {
  id: string;
  topic: string;
  slides: CarouselSlide[];
  theme: CarouselTheme;
  createdAt: Date;
}

export type GenerationStatus = 'idle' | 'generating-text' | 'generating-images' | 'complete';

export interface GenerationProgress {
  status: GenerationStatus;
  currentSlide: number;
  totalSlides: number;
  message: string;
}

export const CAROUSEL_THEMES: CarouselTheme[] = [
  {
    id: 'navy-gold',
    name: 'Navy & Gold',
    primaryColor: 'hsl(220, 55%, 10%)',
    secondaryColor: 'hsl(220, 50%, 18%)',
    accentColor: 'hsl(43, 75%, 55%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(135deg, hsl(220, 55%, 10%) 0%, hsl(220, 50%, 18%) 50%, hsl(220, 45%, 22%) 100%)',
  },
  {
    id: 'dark-tech',
    name: 'Dark Tech',
    primaryColor: 'hsl(220, 40%, 8%)',
    secondaryColor: 'hsl(220, 45%, 15%)',
    accentColor: 'hsl(200, 90%, 50%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(135deg, hsl(220, 40%, 8%) 0%, hsl(220, 45%, 15%) 100%)',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    primaryColor: 'hsl(0, 0%, 12%)',
    secondaryColor: 'hsl(0, 0%, 20%)',
    accentColor: 'hsl(45, 70%, 70%)',
    textColor: 'hsl(0, 0%, 95%)',
    backgroundGradient: 'linear-gradient(180deg, hsl(0, 0%, 12%) 0%, hsl(0, 0%, 20%) 100%)',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primaryColor: 'hsl(210, 60%, 15%)',
    secondaryColor: 'hsl(200, 50%, 25%)',
    accentColor: 'hsl(180, 60%, 50%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(135deg, hsl(210, 60%, 15%) 0%, hsl(200, 50%, 25%) 100%)',
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    primaryColor: 'hsl(270, 50%, 12%)',
    secondaryColor: 'hsl(260, 45%, 20%)',
    accentColor: 'hsl(280, 70%, 60%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(135deg, hsl(270, 50%, 12%) 0%, hsl(260, 45%, 20%) 100%)',
  },
  {
    id: 'warm-coral',
    name: 'Warm Coral',
    primaryColor: 'hsl(15, 40%, 12%)',
    secondaryColor: 'hsl(20, 35%, 18%)',
    accentColor: 'hsl(15, 80%, 60%)',
    textColor: 'hsl(0, 0%, 100%)',
    backgroundGradient: 'linear-gradient(135deg, hsl(15, 40%, 12%) 0%, hsl(20, 35%, 18%) 100%)',
  },
];

export const CONTENT_ICONS = [
  'Lightbulb', 'Target', 'Rocket', 'TrendingUp', 'Zap', 'Star', 'Award', 'CheckCircle',
  'ArrowRight', 'Brain', 'Cpu', 'MessageSquare', 'Users', 'BarChart', 'Sparkles', 'Shield',
  'Clock', 'Settings', 'Layers', 'BookOpen', 'Compass', 'Flag', 'Heart', 'Puzzle'
];
