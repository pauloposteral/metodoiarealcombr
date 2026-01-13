import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  glowColor?: 'accent' | 'gold' | 'none';
  hoverEffect?: boolean;
  neonBorder?: boolean;
}

export const GlassCard = ({
  children,
  className = '',
  glowColor = 'none',
  hoverEffect = true,
  neonBorder = false,
  ...motionProps
}: GlassCardProps) => {
  const glowStyles = {
    accent: 'shadow-[0_0_30px_hsl(var(--accent)/0.15)]',
    gold: 'shadow-[0_0_30px_hsl(var(--gold)/0.15)]',
    none: '',
  };

  return (
    <motion.div
      className={cn(
        'glass-panel rounded-xl p-4',
        neonBorder && 'neon-border',
        hoverEffect && 'hover-scale-micro',
        glowStyles[glowColor],
        className
      )}
      whileHover={hoverEffect ? {
        scale: 1.005,
        transition: { duration: 0.2 }
      } : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

// Glass Button variant
interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const GlassButton = ({
  children,
  variant = 'default',
  size = 'md',
  glow = false,
  className = '',
  ...motionProps
}: GlassButtonProps) => {
  const variantStyles = {
    default: 'glass-panel hover:bg-muted/50',
    accent: 'bg-accent/20 hover:bg-accent/30 text-accent border-accent/30',
    ghost: 'bg-transparent hover:bg-muted/30',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      className={cn(
        'rounded-lg font-medium transition-all duration-200',
        'border border-border/50',
        variantStyles[variant],
        sizeStyles[size],
        glow && 'animate-glow-pulse',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
};