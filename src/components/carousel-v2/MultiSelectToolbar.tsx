import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Copy, Trash2, Move, X, Palette, ArrowDown, ArrowUp } from 'lucide-react';
import { CarouselSlide } from './types';
import { toast } from 'sonner';

interface MultiSelectToolbarProps {
  selectedIndices: Set<number>;
  slides: CarouselSlide[];
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onMoveSelectedUp: () => void;
  onMoveSelectedDown: () => void;
  onApplyStyleToSelected: () => void;
}

export const MultiSelectToolbar = ({
  selectedIndices,
  slides,
  onClearSelection,
  onDeleteSelected,
  onDuplicateSelected,
  onMoveSelectedUp,
  onMoveSelectedDown,
  onApplyStyleToSelected,
}: MultiSelectToolbarProps) => {
  if (selectedIndices.size <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl"
    >
      <span className="text-sm font-medium text-accent mr-2">
        {selectedIndices.size} slides selecionados
      </span>
      
      <div className="h-5 w-px bg-border" />
      
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={onDuplicateSelected}>
        <Copy className="w-3.5 h-3.5" />
        Duplicar
      </Button>
      
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={onMoveSelectedUp}>
        <ArrowUp className="w-3.5 h-3.5" />
      </Button>
      
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={onMoveSelectedDown}>
        <ArrowDown className="w-3.5 h-3.5" />
      </Button>

      <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={onApplyStyleToSelected}>
        <Palette className="w-3.5 h-3.5" />
        Estilo
      </Button>

      <div className="h-5 w-px bg-border" />
      
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-destructive hover:text-destructive" onClick={onDeleteSelected}>
        <Trash2 className="w-3.5 h-3.5" />
        Excluir
      </Button>
      
      <Button variant="ghost" size="icon" className="h-7 w-7 ml-1" onClick={onClearSelection}>
        <X className="w-3.5 h-3.5" />
      </Button>
    </motion.div>
  );
};
