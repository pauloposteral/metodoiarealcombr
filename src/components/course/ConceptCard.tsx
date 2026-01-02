import { LucideIcon } from 'lucide-react';

interface ConceptCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: 'primary' | 'gold' | 'emerald' | 'blue';
}

const ConceptCard = ({ icon: Icon, title, description, color = 'primary' }: ConceptCardProps) => {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    gold: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-500',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-500',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-500'
  };
  
  return (
    <div className={`p-5 rounded-xl bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-foreground/70">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ConceptCard;
