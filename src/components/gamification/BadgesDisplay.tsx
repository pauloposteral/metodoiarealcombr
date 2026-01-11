import { 
  Trophy, Play, BookOpen, GraduationCap, MessageCircle, 
  PenTool, Heart, Star, MessageSquare, Crown, Lock
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  points_required: number;
  earned_at?: string;
}

interface BadgesDisplayProps {
  allBadges: Badge[];
  earnedBadges: Badge[];
  compact?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'trophy': Trophy,
  'play': Play,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'message-circle': MessageCircle,
  'pen-tool': PenTool,
  'heart': Heart,
  'star': Star,
  'message-square': MessageSquare,
  'messages-square': MessageSquare,
  'crown': Crown
};

const colorMap: Record<string, string> = {
  'gold': 'text-yellow-500 bg-yellow-500/20',
  'blue': 'text-blue-500 bg-blue-500/20',
  'green': 'text-green-500 bg-green-500/20',
  'purple': 'text-purple-500 bg-purple-500/20',
  'orange': 'text-orange-500 bg-orange-500/20',
  'red': 'text-red-500 bg-red-500/20',
  'teal': 'text-teal-500 bg-teal-500/20',
  'indigo': 'text-indigo-500 bg-indigo-500/20'
};

export function BadgesDisplay({ allBadges, earnedBadges, compact = false }: BadgesDisplayProps) {
  const earnedIds = new Set(earnedBadges.map(b => b.id));

  if (compact) {
    // Show only earned badges in a horizontal scroll
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {earnedBadges.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum badge conquistado ainda</p>
        ) : (
          earnedBadges.map((badge) => {
            const IconComponent = iconMap[badge.icon] || Trophy;
            const colorClass = colorMap[badge.color] || colorMap['gold'];
            
            return (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">{badge.name}</p>
                    <p className="text-xs">{badge.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-gold" />
        <h3 className="font-display font-bold text-lg text-foreground">Badges</h3>
        <span className="text-sm text-muted-foreground ml-auto">
          {earnedBadges.length} / {allBadges.length}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {allBadges.map((badge) => {
          const isEarned = earnedIds.has(badge.id);
          const IconComponent = iconMap[badge.icon] || Trophy;
          const colorClass = colorMap[badge.color] || colorMap['gold'];
          
          return (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger>
                  <div 
                    className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
                      isEarned 
                        ? `${colorClass} shadow-md` 
                        : 'bg-muted/50 opacity-50'
                    }`}
                  >
                    {isEarned ? (
                      <IconComponent className="w-8 h-8" />
                    ) : (
                      <div className="relative">
                        <IconComponent className="w-8 h-8 text-muted-foreground" />
                        <Lock className="w-4 h-4 absolute -bottom-1 -right-1 text-muted-foreground" />
                      </div>
                    )}
                    <p className={`text-xs mt-2 text-center font-medium truncate w-full ${
                      isEarned ? '' : 'text-muted-foreground'
                    }`}>
                      {badge.name}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-bold">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  {isEarned ? (
                    <p className="text-xs text-green-500 mt-1">✓ Conquistado!</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      {badge.points_required} pontos necessários
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {earnedBadges.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          Complete aulas, faça posts e interaja para conquistar badges!
        </p>
      )}
    </div>
  );
}
