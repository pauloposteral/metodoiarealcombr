import { Lightbulb, AlertTriangle, Info, CheckCircle, LucideIcon } from 'lucide-react';

type TipType = 'tip' | 'warning' | 'info' | 'success';

interface TipBoxProps {
  type: TipType;
  title: string;
  content: string;
}

const TipBox = ({ type, title, content }: TipBoxProps) => {
  const config: Record<TipType, { icon: LucideIcon; color: string; bg: string; border: string }> = {
    tip: {
      icon: Lightbulb,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30'
    },
    info: {
      icon: Info,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30'
    },
    success: {
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30'
    }
  };
  
  const { icon: Icon, color, bg, border } = config[type];
  
  return (
    <div className={`my-6 p-5 rounded-xl ${bg} border ${border}`}>
      <div className="flex items-start gap-3">
        <div className={`shrink-0 mt-0.5 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className={`font-semibold ${color} mb-1`}>{title}</h4>
          <p className="text-sm text-foreground/80">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default TipBox;
