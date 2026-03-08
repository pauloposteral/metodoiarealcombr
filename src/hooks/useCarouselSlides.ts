import { useState, useCallback } from 'react';
import { CarouselSlide } from '@/components/carousel-v2/types';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';

export const useCarouselSlides = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [slidesHistory, setSlidesHistory] = useState<CarouselSlide[][]>([]);
  const [slidesRedoStack, setSlidesRedoStack] = useState<CarouselSlide[][]>([]);
  const [multiSelectedIndices, setMultiSelectedIndices] = useState<Set<number>>(new Set());
  const [clipboardSlides, setClipboardSlides] = useState<CarouselSlide[]>([]);

  const pushHistory = useCallback(() => {
    setSlidesHistory(h => [...h.slice(-29), slides]);
    setSlidesRedoStack([]);
  }, [slides]);

  const handleUpdateSlide = useCallback((index: number, updates: Partial<CarouselSlide>) => {
    pushHistory();
    setSlides(prev => prev.map((slide, i) => i === index ? { ...slide, ...updates } : slide));
  }, [pushHistory]);

  const handleInlineEdit = useCallback((field: 'title' | 'content' | 'subtitle', value: string) => {
    handleUpdateSlide(selectedSlideIndex, { [field]: value });
  }, [selectedSlideIndex, handleUpdateSlide]);

  const handleAddSlide = useCallback(() => {
    const newSlide: CarouselSlide = {
      id: crypto.randomUUID(), type: 'content', title: 'Novo Slide',
      content: 'Adicione seu conteúdo aqui', icon: 'Lightbulb',
      order: slides.length, imagePrompt: 'Abstract educational concept with modern minimal design',
    };
    setSlides([...slides, newSlide]);
    setSelectedSlideIndex(slides.length);
  }, [slides]);

  const handleDeleteSlide = useCallback((index: number) => {
    if (slides.length <= 2) { toast.error('Mínimo de 2 slides necessários'); return; }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (selectedSlideIndex >= newSlides.length) setSelectedSlideIndex(Math.max(0, newSlides.length - 1));
  }, [slides, selectedSlideIndex]);

  const handleReorderSlides = useCallback((startIndex: number, endIndex: number) => {
    setSlides(prev => arrayMove(prev, startIndex, endIndex).map((s, i) => ({ ...s, order: i })));
    setSelectedSlideIndex(endIndex);
  }, []);

  // Multi-select
  const handleSlideClick = useCallback((index: number, e?: React.MouseEvent) => {
    if (e?.shiftKey) {
      setMultiSelectedIndices(prev => {
        const next = new Set(prev);
        next.has(index) ? next.delete(index) : next.add(index);
        next.add(selectedSlideIndex);
        return next;
      });
    } else if (e?.ctrlKey || e?.metaKey) {
      setMultiSelectedIndices(prev => { const next = new Set(prev); next.add(index); return next; });
      setSelectedSlideIndex(index);
    } else {
      setMultiSelectedIndices(new Set());
      setSelectedSlideIndex(index);
    }
  }, [selectedSlideIndex]);

  const handleDeleteMultiSelected = useCallback(() => {
    if (multiSelectedIndices.size === 0) return;
    const remaining = slides.filter((_, i) => !multiSelectedIndices.has(i));
    if (remaining.length < 2) { toast.error('Mínimo de 2 slides necessários'); return; }
    pushHistory();
    setSlides(remaining.map((s, i) => ({ ...s, order: i })));
    setMultiSelectedIndices(new Set());
    setSelectedSlideIndex(0);
    toast.success(`${multiSelectedIndices.size} slides excluídos`);
  }, [multiSelectedIndices, slides, pushHistory]);

  const handleDuplicateMultiSelected = useCallback(() => {
    const indices = Array.from(multiSelectedIndices).sort((a, b) => a - b);
    if (indices.length === 0) return;
    const dupes = indices.map(i => ({ ...slides[i], id: crypto.randomUUID(), order: slides.length }));
    pushHistory();
    setSlides([...slides, ...dupes].map((s, i) => ({ ...s, order: i })));
    setMultiSelectedIndices(new Set());
    toast.success(`${dupes.length} slides duplicados`);
  }, [multiSelectedIndices, slides, pushHistory]);

  const handleMoveMultiSelected = useCallback((direction: 'up' | 'down') => {
    const indices = Array.from(multiSelectedIndices).sort((a, b) => a - b);
    if (indices.length === 0) return;
    const newSlides = [...slides];
    if (direction === 'up' && indices[0] > 0) {
      for (const idx of indices) [newSlides[idx - 1], newSlides[idx]] = [newSlides[idx], newSlides[idx - 1]];
    } else if (direction === 'down' && indices[indices.length - 1] < slides.length - 1) {
      for (const idx of [...indices].reverse()) [newSlides[idx + 1], newSlides[idx]] = [newSlides[idx], newSlides[idx + 1]];
    }
    pushHistory();
    setSlides(newSlides.map((s, i) => ({ ...s, order: i })));
  }, [multiSelectedIndices, slides, pushHistory]);

  const handleApplyStyleToMultiSelected = useCallback(() => {
    if (multiSelectedIndices.size === 0) return;
    const source = slides[selectedSlideIndex];
    if (!source) return;
    const styleProps: Partial<CarouselSlide> = {
      customTextColor: source.customTextColor, customAccentColor: source.customAccentColor,
      imageFilter: source.imageFilter, imageOpacity: source.imageOpacity,
      textShadowStyle: source.textShadowStyle, glassmorphism: source.glassmorphism,
      backgroundPattern: source.backgroundPattern, titleFontSize: source.titleFontSize,
      contentFontSize: source.contentFontSize, textAlignment: source.textAlignment,
      textPosition: source.textPosition,
    };
    pushHistory();
    setSlides(prev => prev.map((s, i) => multiSelectedIndices.has(i) ? { ...s, ...styleProps } : s));
    setMultiSelectedIndices(new Set());
    toast.success('Estilo aplicado aos slides selecionados!');
  }, [multiSelectedIndices, slides, selectedSlideIndex, pushHistory]);

  const handleCopySlides = useCallback(() => {
    const indices = multiSelectedIndices.size > 0 ? Array.from(multiSelectedIndices) : [selectedSlideIndex];
    setClipboardSlides(indices.map(i => slides[i]).filter(Boolean));
    toast.success(`${indices.length} slide(s) copiado(s)`);
  }, [multiSelectedIndices, selectedSlideIndex, slides]);

  const handlePasteSlides = useCallback(() => {
    if (clipboardSlides.length === 0) return;
    const pasted = clipboardSlides.map(s => ({ ...s, id: crypto.randomUUID(), order: slides.length }));
    pushHistory();
    setSlides([...slides, ...pasted].map((s, i) => ({ ...s, order: i })));
    toast.success(`${pasted.length} slide(s) colado(s)`);
  }, [clipboardSlides, slides, pushHistory]);

  const handleDuplicateCurrentSlide = useCallback(() => {
    const slide = slides[selectedSlideIndex];
    if (!slide) return;
    const dupe = { ...slide, id: crypto.randomUUID(), order: selectedSlideIndex + 1 };
    const newSlides = [...slides];
    newSlides.splice(selectedSlideIndex + 1, 0, dupe);
    pushHistory();
    setSlides(newSlides.map((s, i) => ({ ...s, order: i })));
    setSelectedSlideIndex(selectedSlideIndex + 1);
    toast.success('Slide duplicado!');
  }, [slides, selectedSlideIndex, pushHistory]);

  const undo = useCallback(() => {
    if (slidesHistory.length > 0) {
      const prev = slidesHistory[slidesHistory.length - 1];
      setSlidesRedoStack(stack => [slides, ...stack]);
      setSlidesHistory(h => h.slice(0, -1));
      setSlides(prev);
      toast.info('Desfazer');
    }
  }, [slidesHistory, slides]);

  const redo = useCallback(() => {
    if (slidesRedoStack.length > 0) {
      const next = slidesRedoStack[0];
      setSlidesHistory(h => [...h, slides]);
      setSlidesRedoStack(stack => stack.slice(1));
      setSlides(next);
      toast.info('Refazer');
    }
  }, [slidesRedoStack, slides]);

  return {
    slides, setSlides, selectedSlideIndex, setSelectedSlideIndex,
    slidesHistory, slidesRedoStack,
    multiSelectedIndices, setMultiSelectedIndices,
    handleUpdateSlide, handleInlineEdit, handleAddSlide,
    handleDeleteSlide, handleReorderSlides,
    handleSlideClick, handleDeleteMultiSelected,
    handleDuplicateMultiSelected, handleMoveMultiSelected,
    handleApplyStyleToMultiSelected,
    handleCopySlides, handlePasteSlides, handleDuplicateCurrentSlide,
    undo, redo,
  };
};
