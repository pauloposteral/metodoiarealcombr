import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CarouselSlide, CarouselTheme, CarouselConfig, CarouselData, QualityScore } from '@/components/carousel-v2/types';

export interface SavedCarousel {
  id: string;
  user_id: string;
  topic: string;
  config: CarouselConfig | null;
  slides: CarouselSlide[];
  theme: CarouselTheme | null;
  caption: string | null;
  hashtags: string[];
  first_comment: string | null;
  alternative_title: string | null;
  quality_score: QualityScore | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useCarouselPersistence() {
  const [savedCarousels, setSavedCarousels] = useState<SavedCarousel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch all saved carousels
  const fetchCarousels = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_carousels')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSavedCarousels((data || []) as unknown as SavedCarousel[]);
    } catch (error) {
      console.error('Error fetching carousels:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save carousel (create or update)
  const saveCarousel = useCallback(async (
    carouselData: CarouselData,
    slides: CarouselSlide[],
    theme: CarouselTheme,
    config: CarouselConfig | null,
    qualityScore: QualityScore | null,
  ) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Faça login para salvar');
        return null;
      }

      const payload = {
        user_id: user.id,
        topic: carouselData.topic,
        config: config as any,
        slides: slides as any,
        theme: theme as any,
        caption: carouselData.caption || null,
        hashtags: carouselData.hashtags || [],
        first_comment: carouselData.firstComment || null,
        alternative_title: carouselData.alternativeTitle || null,
        quality_score: qualityScore as any,
        thumbnail_url: slides[0]?.imageUrl || null,
      };

      if (currentSavedId) {
        // Update existing
        const { error } = await supabase
          .from('saved_carousels')
          .update(payload)
          .eq('id', currentSavedId);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('saved_carousels')
          .insert(payload)
          .select('id')
          .single();

        if (error) throw error;
        setCurrentSavedId(data.id);
      }

      await fetchCarousels();
      return currentSavedId;
    } catch (error) {
      console.error('Error saving carousel:', error);
      toast.error('Erro ao salvar carrossel');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [currentSavedId, fetchCarousels]);

  // Auto-save with debounce
  const scheduleAutoSave = useCallback((
    carouselData: CarouselData,
    slides: CarouselSlide[],
    theme: CarouselTheme,
    config: CarouselConfig | null,
    qualityScore: QualityScore | null,
  ) => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = setTimeout(() => {
      saveCarousel(carouselData, slides, theme, config, qualityScore);
    }, 3000);
  }, [saveCarousel]);

  // Delete carousel
  const deleteCarousel = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_carousels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSavedCarousels(prev => prev.filter(c => c.id !== id));
      if (currentSavedId === id) setCurrentSavedId(null);
      toast.success('Carrossel excluído');
    } catch (error) {
      console.error('Error deleting carousel:', error);
      toast.error('Erro ao excluir');
    }
  }, [currentSavedId]);

  // Duplicate carousel
  const duplicateCarousel = useCallback(async (id: string) => {
    try {
      const original = savedCarousels.find(c => c.id === id);
      if (!original) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_carousels')
        .insert({
          user_id: user.id,
          topic: `${original.topic} (cópia)`,
          config: original.config as any,
          slides: original.slides as any,
          theme: original.theme as any,
          caption: original.caption,
          hashtags: original.hashtags,
          first_comment: original.first_comment,
          alternative_title: original.alternative_title,
          quality_score: original.quality_score as any,
          thumbnail_url: original.thumbnail_url,
        });

      if (error) throw error;
      await fetchCarousels();
      toast.success('Carrossel duplicado!');
    } catch (error) {
      console.error('Error duplicating:', error);
      toast.error('Erro ao duplicar');
    }
  }, [savedCarousels, fetchCarousels]);

  // Load saved data on mount
  useEffect(() => {
    fetchCarousels();
  }, [fetchCarousels]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  return {
    savedCarousels,
    isLoading,
    isSaving,
    currentSavedId,
    setCurrentSavedId,
    fetchCarousels,
    saveCarousel,
    scheduleAutoSave,
    deleteCarousel,
    duplicateCarousel,
  };
}
