import { X, Check } from 'lucide-react';

interface ComparisonBoxProps {
  title: string;
  before: {
    label: string;
    content: string;
  };
  after: {
    label: string;
    content: string;
  };
}

const ComparisonBox = ({ title, before, after }: ComparisonBoxProps) => {
  return (
    <div className="my-8 rounded-2xl border border-border overflow-hidden">
      <div className="bg-muted/50 px-6 py-3 border-b border-border">
        <h4 className="font-bold text-foreground text-center">{title}</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Before */}
        <div className="p-5 bg-destructive/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <X className="w-4 h-4 text-destructive" />
            </div>
            <span className="font-semibold text-destructive">{before.label}</span>
          </div>
          <div className="text-sm text-foreground/80 bg-destructive/10 rounded-lg p-4 border border-destructive/20">
            <code className="text-destructive/90">{before.content}</code>
          </div>
        </div>
        
        {/* After */}
        <div className="p-5 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{after.label}</span>
          </div>
          <div className="text-sm text-foreground/80 bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
            <code className="text-emerald-700 dark:text-emerald-300">{after.content}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBox;
