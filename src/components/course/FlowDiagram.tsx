import { ArrowRight, ArrowDown } from 'lucide-react';

interface FlowStep {
  icon: React.ReactNode;
  label: string;
  description?: string;
}

interface FlowDiagramProps {
  title: string;
  steps: FlowStep[];
  direction?: 'horizontal' | 'vertical';
}

const FlowDiagram = ({ title, steps, direction = 'horizontal' }: FlowDiagramProps) => {
  const isHorizontal = direction === 'horizontal';
  
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20">
      <h4 className="text-lg font-bold text-foreground mb-6 text-center">{title}</h4>
      
      <div className={`flex ${isHorizontal ? 'flex-row flex-wrap justify-center' : 'flex-col'} gap-4 items-center`}>
        {steps.map((step, index) => (
          <div key={index} className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center gap-4`}>
            {/* Step card */}
            <div className="flex flex-col items-center text-center min-w-[120px] max-w-[160px]">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-3 shadow-lg">
                {step.icon}
              </div>
              <span className="font-semibold text-foreground text-sm">{step.label}</span>
              {step.description && (
                <span className="text-xs text-muted-foreground mt-1">{step.description}</span>
              )}
            </div>
            
            {/* Arrow */}
            {index < steps.length - 1 && (
              <div className="text-primary/60">
                {isHorizontal ? (
                  <ArrowRight className="w-6 h-6" />
                ) : (
                  <ArrowDown className="w-6 h-6" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowDiagram;
