import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Lightbulb, AlertTriangle, CheckCircle2, Pencil, ArrowRight } from 'lucide-react';

interface BlockProps {
  children: ReactNode;
  className?: string;
}

export const TipBox = ({ children, className }: BlockProps) => (
  <div className={cn(
    "bg-accent/5 border-l-4 border-accent rounded-r-xl p-4 my-4",
    className
  )}>
    <div className="flex items-start gap-3">
      <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
      <div className="text-sm text-foreground">{children}</div>
    </div>
  </div>
);

export const WarningBox = ({ children, className }: BlockProps) => (
  <div className={cn(
    "bg-orange-500/5 border-l-4 border-orange-500 rounded-r-xl p-4 my-4",
    className
  )}>
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-foreground">{children}</div>
    </div>
  </div>
);

export const SuccessBox = ({ children, className }: BlockProps) => (
  <div className={cn(
    "bg-green-500/5 border-l-4 border-green-500 rounded-r-xl p-4 my-4",
    className
  )}>
    <div className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-foreground">{children}</div>
    </div>
  </div>
);

interface ExerciseBoxProps extends BlockProps {
  title?: string;
}

export const ExerciseBox = ({ title, children, className }: ExerciseBoxProps) => (
  <div className={cn(
    "bg-primary/5 border border-primary/20 rounded-2xl p-5 my-6",
    className
  )}>
    <div className="flex items-center gap-2 mb-3">
      <Pencil className="w-4 h-4 text-primary" />
      <h4 className="font-display font-bold text-sm text-foreground">
        {title || 'Exercício Prático'}
      </h4>
    </div>
    <div className="text-sm text-foreground">{children}</div>
  </div>
);

interface StepByStepProps {
  steps: string[];
  className?: string;
}

export const StepByStep = ({ steps, className }: StepByStepProps) => (
  <div className={cn("my-6 space-y-3", className)}>
    {steps.map((step, i) => (
      <div key={i} className="flex items-start gap-3">
        <span className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
          {i + 1}
        </span>
        <div className="flex-1 pt-1">
          <p className="text-sm text-foreground">{step}</p>
          {i < steps.length - 1 && (
            <ArrowRight className="w-3 h-3 text-muted-foreground/30 mt-2" />
          )}
        </div>
      </div>
    ))}
  </div>
);

interface ComparisonBoxProps {
  title?: string;
  left: { label: string; items: string[] };
  right: { label: string; items: string[] };
  className?: string;
}

export const ComparisonBox = ({ title, left, right, className }: ComparisonBoxProps) => (
  <div className={cn("bg-card border border-border/50 rounded-2xl p-5 my-6", className)}>
    {title && <h4 className="font-display font-bold text-sm text-foreground mb-4 text-center">{title}</h4>}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
        <p className="text-xs font-bold text-destructive mb-2">{left.label}</p>
        <ul className="space-y-1.5">
          {left.items.map((item, i) => (
            <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
              <span className="text-destructive mt-0.5">✗</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
        <p className="text-xs font-bold text-green-500 mb-2">{right.label}</p>
        <ul className="space-y-1.5">
          {right.items.map((item, i) => (
            <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
              <span className="text-green-500 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
