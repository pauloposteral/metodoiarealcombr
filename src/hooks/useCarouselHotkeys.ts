import { useEffect } from 'react';

interface UseCarouselHotkeysProps {
  step: 'wizard' | 'editor';
  selectedSlideIndex: number;
  slidesLength: number;
  setSelectedSlideIndex: (fn: (prev: number) => number) => void;
  handleSave: () => void;
  undo: () => void;
  redo: () => void;
  handleNewCarousel: () => void;
  handleCopySlides: () => void;
  handlePasteSlides: () => void;
  handleDuplicateCurrentSlide: () => void;
  handleDeleteMultiSelected: () => void;
  multiSelectedSize: number;
  isFullscreen: boolean;
  setIsFullscreen: (fn: (prev: boolean) => boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const useCarouselHotkeys = ({
  step, selectedSlideIndex, slidesLength,
  setSelectedSlideIndex, handleSave, undo, redo,
  handleNewCarousel, handleCopySlides, handlePasteSlides,
  handleDuplicateCurrentSlide, handleDeleteMultiSelected,
  multiSelectedSize, isFullscreen, setIsFullscreen,
  canUndo, canRedo,
}: UseCarouselHotkeysProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step !== 'editor') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowLeft' && selectedSlideIndex > 0) {
        e.preventDefault(); setSelectedSlideIndex(prev => prev - 1);
      }
      if (e.key === 'ArrowRight' && selectedSlideIndex < slidesLength - 1) {
        e.preventDefault(); setSelectedSlideIndex(prev => prev + 1);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); if (canUndo) undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); if (canRedo) redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); handleNewCarousel(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); handleCopySlides(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); handlePasteSlides(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); handleDuplicateCurrentSlide(); }
      if (e.key === 'Delete' && multiSelectedSize > 1) { e.preventDefault(); handleDeleteMultiSelected(); }
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(() => false);
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) setIsFullscreen(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, selectedSlideIndex, slidesLength, canUndo, canRedo, isFullscreen, multiSelectedSize]);
};
