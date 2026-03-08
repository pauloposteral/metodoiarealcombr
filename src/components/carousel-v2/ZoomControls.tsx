import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Minimize2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canvasWidth: number;
  canvasHeight: number;
  containerWidth?: number;
  containerHeight?: number;
}

const ZOOM_PRESETS = [
  { label: '25%', value: 0.25 },
  { label: '33%', value: 0.33 },
  { label: '50%', value: 0.50 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1.0 },
];

export const ZoomControls = ({
  zoom,
  onZoomChange,
  canvasWidth,
  canvasHeight,
  containerWidth = 800,
  containerHeight = 600,
}: ZoomControlsProps) => {
  const handleZoomToFit = () => {
    const scaleX = (containerWidth * 0.85) / canvasWidth;
    const scaleY = (containerHeight * 0.85) / canvasHeight;
    const fitZoom = Math.min(scaleX, scaleY, 0.8);
    onZoomChange(Math.max(0.15, fitZoom));
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button 
        variant="outline" 
        size="icon"
        className="h-8 w-8"
        onClick={() => onZoomChange(Math.max(0.15, zoom - 0.05))}
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-14 text-xs font-mono">
            {Math.round(zoom * 100)}%
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="min-w-[100px]">
          {ZOOM_PRESETS.map(preset => (
            <DropdownMenuItem 
              key={preset.value} 
              onClick={() => onZoomChange(preset.value)}
              className={zoom === preset.value ? 'bg-accent/20' : ''}
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={handleZoomToFit} className="gap-2">
            <Maximize className="w-3.5 h-3.5" />
            Ajustar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button 
        variant="outline" 
        size="icon"
        className="h-8 w-8"
        onClick={() => onZoomChange(Math.min(1.0, zoom + 0.05))}
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleZoomToFit}
        title="Zoom para caber"
      >
        <Maximize className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
