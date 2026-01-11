import { CarouselSlide, CarouselTheme } from './types';
import { supabase } from '@/integrations/supabase/client';

export async function generateCarouselContent(topic: string, slideCount: number): Promise<CarouselSlide[]> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Usuário não autenticado');
  }

  const response = await supabase.functions.invoke('generate-carousel', {
    body: { topic, slideCount },
  });

  if (response.error) {
    console.error('Edge function error:', response.error);
    throw new Error(response.error.message || 'Erro ao gerar conteúdo');
  }

  return response.data.slides as CarouselSlide[];
}

export async function generateSlideImage(
  slide: CarouselSlide, 
  themeColors: string
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Usuário não autenticado');
  }

  // Use the imagePrompt from the slide, or generate one from the title
  const prompt = slide.imagePrompt || `Educational visual for: ${slide.title}. ${slide.content || ''}`;

  const response = await supabase.functions.invoke('generate-slide-image', {
    body: { 
      prompt,
      slideType: slide.type,
      themeColors,
    },
  });

  if (response.error) {
    console.error('Image generation error:', response.error);
    throw new Error(response.error.message || 'Erro ao gerar imagem');
  }

  return response.data.imageUrl as string;
}

export async function generateAllSlideImages(
  slides: CarouselSlide[],
  theme: CarouselTheme,
  onProgress: (slideIndex: number, imageUrl: string) => void,
  onError: (slideIndex: number, error: string) => void
): Promise<void> {
  const themeColors = `${theme.name} - Primary: ${theme.primaryColor}, Accent: ${theme.accentColor}`;
  
  // Generate images sequentially to avoid rate limits
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    try {
      const imageUrl = await generateSlideImage(slide, themeColors);
      onProgress(i, imageUrl);
      
      // Small delay between requests to avoid rate limiting
      if (i < slides.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error generating image for slide ${i}:`, error);
      onError(i, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }
}
