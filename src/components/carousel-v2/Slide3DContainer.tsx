import { useState, useRef, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Slide3DContainerProps {
  children: ReactNode;
  className?: string;
  enableRotation?: boolean;
  intensity?: number;
}

export const Slide3DContainer = ({ 
  children, 
  className = '',
  enableRotation = true,
  intensity = 1
}: Slide3DContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableRotation || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Limit rotation to ±5 degrees
    const maxRotation = 5 * intensity;
    const rotY = (mouseX / (rect.width / 2)) * maxRotation;
    const rotX = -(mouseY / (rect.height / 2)) * maxRotation;
    
    setRotateX(rotX);
    setRotateY(rotY);
  }, [enableRotation, intensity]);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        perspective: '1200px',
        perspectiveOrigin: 'center center',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.div
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
        className="relative"
      >
        {/* Main content */}
        {children}
        
        {/* Reflection effect */}
        <div 
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-16 opacity-20 blur-xl rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--accent) / 0.3) 0%, transparent 100%)',
            transform: 'translateZ(-20px) rotateX(180deg) scaleY(0.5)',
          }}
        />
        
        {/* Dynamic shadow based on rotation */}
        <div 
          className="absolute -bottom-6 left-1/2 w-[85%] h-8 opacity-30 blur-2xl rounded-full pointer-events-none transition-all duration-300"
          style={{
            background: 'hsl(var(--foreground) / 0.3)',
            transform: `translateX(calc(-50% + ${rotateY * 2}px)) translateZ(-30px)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
};