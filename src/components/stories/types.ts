// ==========================================
// STORIES CREATOR TYPES
// ==========================================

export type StoryStyle = 
  | 'editorial'
  | 'minimal'
  | 'bold'
  | 'dreamy'
  | 'luxury'
  | 'neon'
  | 'nature'
  | 'tech';

export type StoryType = 
  | 'promo'
  | 'quote'
  | 'product'
  | 'announcement'
  | 'behind-scenes'
  | 'tutorial'
  | 'engagement'
  | 'lifestyle';

export interface StorySlide {
  id: string;
  imageUrl?: string;
  prompt: string;
  style: StoryStyle;
  type: StoryType;
  textOverlay?: StoryTextOverlay;
  isGenerating?: boolean;
  order: number;
}

export interface StoryTextOverlay {
  text: string;
  position: 'top' | 'center' | 'bottom';
  style: 'modern' | 'elegant' | 'bold' | 'minimal' | 'neon';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  color: string;
  backgroundColor?: string;
}

export interface StoryProject {
  id: string;
  name: string;
  slides: StorySlide[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  slides: Partial<StorySlide>[];
  previewImage?: string;
}

// Style configurations with visual metadata
export const STORY_STYLES: Record<StoryStyle, {
  label: string;
  description: string;
  icon: string;
  colors: string[];
  gradient: string;
}> = {
  editorial: {
    label: 'Editorial',
    description: 'High-fashion, magazine quality',
    icon: '📸',
    colors: ['#1a1a2e', '#16213e', '#0f3460'],
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
  minimal: {
    label: 'Minimal',
    description: 'Clean, lots of whitespace',
    icon: '⬜',
    colors: ['#f5f5f5', '#e0e0e0', '#9e9e9e'],
    gradient: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
  },
  bold: {
    label: 'Bold',
    description: 'Vibrant, eye-catching',
    icon: '🔥',
    colors: ['#ff6b6b', '#feca57', '#48dbfb'],
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
  },
  dreamy: {
    label: 'Dreamy',
    description: 'Soft, ethereal vibes',
    icon: '✨',
    colors: ['#ffecd2', '#fcb69f', '#ee9ca7'],
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ee9ca7 100%)',
  },
  luxury: {
    label: 'Luxury',
    description: 'Premium, sophisticated',
    icon: '👑',
    colors: ['#0c0c0c', '#1a1a1a', '#d4af37'],
    gradient: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 70%, #d4af37 100%)',
  },
  neon: {
    label: 'Neon',
    description: 'Cyberpunk, glowing',
    icon: '💜',
    colors: ['#0a0a0a', '#ff00ff', '#00ffff'],
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a1a2e 100%)',
  },
  nature: {
    label: 'Nature',
    description: 'Organic, earth tones',
    icon: '🌿',
    colors: ['#2d5a27', '#8bc34a', '#f4e8c1'],
    gradient: 'linear-gradient(135deg, #2d5a27 0%, #8bc34a 50%, #f4e8c1 100%)',
  },
  tech: {
    label: 'Tech',
    description: 'Futuristic, innovative',
    icon: '🚀',
    colors: ['#0f0f23', '#1e3a5f', '#4a90a4'],
    gradient: 'linear-gradient(135deg, #0f0f23 0%, #1e3a5f 50%, #4a90a4 100%)',
  },
};

export const STORY_TYPES: Record<StoryType, {
  label: string;
  description: string;
  icon: string;
}> = {
  promo: {
    label: 'Promoção',
    description: 'Ofertas e vendas',
    icon: '🏷️',
  },
  quote: {
    label: 'Citação',
    description: 'Frases inspiradoras',
    icon: '💬',
  },
  product: {
    label: 'Produto',
    description: 'Showcase de produto',
    icon: '📦',
  },
  announcement: {
    label: 'Anúncio',
    description: 'Novidades importantes',
    icon: '📢',
  },
  'behind-scenes': {
    label: 'Bastidores',
    description: 'Conteúdo autêntico',
    icon: '🎬',
  },
  tutorial: {
    label: 'Tutorial',
    description: 'Conteúdo educativo',
    icon: '📚',
  },
  engagement: {
    label: 'Engajamento',
    description: 'Interação com público',
    icon: '💡',
  },
  lifestyle: {
    label: 'Lifestyle',
    description: 'Estilo de vida',
    icon: '✨',
  },
};

// Pre-built templates
export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'flash-sale',
    name: 'Flash Sale',
    description: 'Promoção relâmpago com urgência',
    category: 'promo',
    slides: [
      { type: 'promo', style: 'bold', prompt: 'Explosive flash sale visual with countdown timer aesthetic' },
      { type: 'product', style: 'luxury', prompt: 'Premium product spotlight with dramatic lighting' },
      { type: 'engagement', style: 'neon', prompt: 'Swipe up call to action with glowing elements' },
    ],
  },
  {
    id: 'launch-sequence',
    name: 'Launch Sequence',
    description: 'Sequência de lançamento de produto',
    category: 'announcement',
    slides: [
      { type: 'announcement', style: 'tech', prompt: 'Teaser reveal with mysterious silhouette' },
      { type: 'product', style: 'minimal', prompt: 'Clean product reveal on white background' },
      { type: 'promo', style: 'bold', prompt: 'Launch celebration with confetti and energy' },
    ],
  },
  {
    id: 'motivation-series',
    name: 'Série Motivacional',
    description: 'Citações inspiradoras',
    category: 'quote',
    slides: [
      { type: 'quote', style: 'dreamy', prompt: 'Sunrise over mountains, new beginnings theme' },
      { type: 'quote', style: 'editorial', prompt: 'Person conquering challenges, silhouette style' },
      { type: 'quote', style: 'minimal', prompt: 'Simple elegant background for powerful quote' },
    ],
  },
  {
    id: 'brand-story',
    name: 'Brand Story',
    description: 'Conte a história da sua marca',
    category: 'lifestyle',
    slides: [
      { type: 'behind-scenes', style: 'editorial', prompt: 'Behind the scenes of creative process' },
      { type: 'lifestyle', style: 'dreamy', prompt: 'Brand values and mission visualization' },
      { type: 'engagement', style: 'minimal', prompt: 'Community and connection theme' },
    ],
  },
];