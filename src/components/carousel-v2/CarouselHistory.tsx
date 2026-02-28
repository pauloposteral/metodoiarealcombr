import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, Trash2, Copy, FolderOpen, Plus, Image as ImageIcon 
} from 'lucide-react';
import type { SavedCarousel } from '@/hooks/useCarouselPersistence';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CarouselHistoryProps {
  carousels: SavedCarousel[];
  isLoading: boolean;
  onLoad: (carousel: SavedCarousel) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onNewCarousel: () => void;
}

export const CarouselHistory = ({
  carousels,
  isLoading,
  onLoad,
  onDelete,
  onDuplicate,
  onNewCarousel,
}: CarouselHistoryProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (carousels.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <FolderOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <h3 className="font-semibold mb-1">Nenhum carrossel salvo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Seus carrosséis serão salvos automaticamente aqui
        </p>
        <Button onClick={onNewCarousel} className="gap-2">
          <Plus className="w-4 h-4" />
          Criar Novo
        </Button>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3 pr-2">
        {carousels.map((carousel, idx) => (
          <motion.div
            key={carousel.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className="p-3 cursor-pointer hover:border-accent/50 transition-all group"
              onClick={() => onLoad(carousel)}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  {carousel.thumbnail_url ? (
                    <img
                      src={carousel.thumbnail_url}
                      alt={carousel.topic}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{carousel.topic}</p>
                  <p className="text-xs text-muted-foreground">
                    {(carousel.slides as any[])?.length || 0} slides
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(carousel.updated_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(carousel.id);
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(carousel.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};
