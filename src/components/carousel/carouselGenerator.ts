import { CarouselSlide } from './types';
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
