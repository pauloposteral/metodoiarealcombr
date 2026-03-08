import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Move, GripVertical } from 'lucide-react';
import { calculateSnapGuides, CanvasSnapGuides } from './CanvasSnapGuides';

interface DraggableTextOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  textPositionX?: number; // 0-100
  textPositionY?: number; // 0-100 (mapped to top/center/bottom)
  onPositionChange: (x: number, y: number) => void;
  enabled: boolean;
}

export const DraggableTextOverlay = ({
  canvasWidth,
  canvasHeight,
  zoom,
  textPositionX = 50,
  textPositionY = 50,
  onPositionChange,
  enabled,
}: DraggableTextOverlayProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: textPositionX, y: textPositionY });
  const [guides, setGuides] = useState<{ type: 'horizontal' | 'vertical'; position: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: textPositionX, y: textPositionY });
  }, [textPositionX, textPositionY]);

  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(5, Math.min(95, rawX));
    const clampedY = Math.max(5, Math.min(95, rawY));

    // Calculate snap
    const { snappedX, snappedY, guides: newGuides } = calculateSnapGuides(
      clampedX * canvasWidth / 100,
      clampedY * canvasHeight / 100,
      canvasWidth,
      canvasHeight,
      canvasWidth * 0.03
    );

    const finalX = (snappedX / canvasWidth) * 100;
    const finalY = (snappedY / canvasHeight) * 100;

    setPosition({ x: finalX, y: finalY });
    setGuides(newGuides);
  }, [isDragging, canvasWidth, canvasHeight]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setGuides([]);
    onPositionChange(position.x, position.y);
  }, [position, onPositionChange]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30"
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <CanvasSnapGuides
        guides={guides}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        visible={isDragging}
      />

      {/* Draggable handle */}
      <motion.div
        className={`absolute cursor-move select-none ${isDragging ? 'z-50' : 'z-40'}`}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          isDragging 
            ? 'bg-accent text-accent-foreground shadow-lg ring-2 ring-accent/50' 
            : 'bg-background/80 text-foreground border border-border/50 backdrop-blur-sm opacity-60 hover:opacity-100'
        }`}>
          <Move className="w-3 h-3" />
          <span>Texto</span>
        </div>
      </motion.div>

      {/* Position indicator lines when dragging */}
      {isDragging && (
        <>
          <div 
            className="absolute h-px bg-accent/30" 
            style={{ left: 0, right: 0, top: `${position.y}%` }} 
          />
          <div 
            className="absolute w-px bg-accent/30" 
            style={{ top: 0, bottom: 0, left: `${position.x}%` }} 
          />
        </>
      )}
    </div>
  );
};
