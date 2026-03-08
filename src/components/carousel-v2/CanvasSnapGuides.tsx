import { motion } from 'framer-motion';

interface CanvasSnapGuidesProps {
  guides: { type: 'horizontal' | 'vertical'; position: number }[];
  canvasWidth: number;
  canvasHeight: number;
  visible: boolean;
}

export const CanvasSnapGuides = ({ guides, canvasWidth, canvasHeight, visible }: CanvasSnapGuidesProps) => {
  if (!visible || guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {guides.map((guide, i) => (
        <motion.div
          key={`${guide.type}-${guide.position}-${i}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute"
          style={
            guide.type === 'horizontal'
              ? {
                  left: 0,
                  right: 0,
                  top: `${(guide.position / canvasHeight) * 100}%`,
                  height: 1,
                  background: 'linear-gradient(90deg, transparent, hsl(var(--accent)), transparent)',
                }
              : {
                  top: 0,
                  bottom: 0,
                  left: `${(guide.position / canvasWidth) * 100}%`,
                  width: 1,
                  background: 'linear-gradient(180deg, transparent, hsl(var(--accent)), transparent)',
                }
          }
        />
      ))}
      
      {/* Center guides always visible faintly */}
      <div
        className="absolute opacity-[0.08]"
        style={{
          left: '50%',
          top: 0,
          bottom: 0,
          width: 1,
          background: 'hsl(var(--accent))',
        }}
      />
      <div
        className="absolute opacity-[0.08]"
        style={{
          top: '50%',
          left: 0,
          right: 0,
          height: 1,
          background: 'hsl(var(--accent))',
        }}
      />
    </div>
  );
};

// Snap position calculator
export const calculateSnapGuides = (
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number,
  threshold: number = 10
): { snappedX: number; snappedY: number; guides: { type: 'horizontal' | 'vertical'; position: number }[] } => {
  const guides: { type: 'horizontal' | 'vertical'; position: number }[] = [];
  let snappedX = x;
  let snappedY = y;

  const snapPoints = {
    x: [0, canvasWidth * 0.25, canvasWidth * 0.5, canvasWidth * 0.75, canvasWidth],
    y: [0, canvasHeight * 0.25, canvasHeight * 0.5, canvasHeight * 0.75, canvasHeight],
  };

  for (const sx of snapPoints.x) {
    if (Math.abs(x - sx) < threshold) {
      snappedX = sx;
      guides.push({ type: 'vertical', position: sx });
      break;
    }
  }

  for (const sy of snapPoints.y) {
    if (Math.abs(y - sy) < threshold) {
      snappedY = sy;
      guides.push({ type: 'horizontal', position: sy });
      break;
    }
  }

  return { snappedX, snappedY, guides };
};
