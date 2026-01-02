interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepByStepProps {
  title: string;
  steps: Step[];
}

const StepByStep = ({ title, steps }: StepByStepProps) => {
  return (
    <div className="my-8 p-6 bg-muted/30 rounded-2xl border border-border">
      <h4 className="text-lg font-bold text-foreground mb-6">{title}</h4>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            {/* Number circle with connecting line */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 flex-1 bg-primary/30 my-2" />
              )}
            </div>
            
            {/* Content */}
            <div className="pb-6">
              <h5 className="font-semibold text-foreground mb-1">{step.title}</h5>
              <p className="text-sm text-foreground/70">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepByStep;
