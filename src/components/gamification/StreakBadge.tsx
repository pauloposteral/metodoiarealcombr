import { Flame, Trophy } from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';

interface StreakBadgeProps {
  userId: string;
}

export const StreakBadge = ({ userId }: StreakBadgeProps) => {
  const { streak, loading } = useStreak(userId);

  if (loading) return null;

  const isActive = streak.current_streak > 0;

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
        isActive
          ? 'bg-orange-500/15 text-orange-500'
          : 'bg-muted text-muted-foreground'
      }`}>
        <Flame className={`w-3.5 h-3.5 ${isActive ? 'text-orange-500' : ''}`} />
        {streak.current_streak}
      </div>
      {streak.longest_streak > 2 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-accent/10 text-accent">
          <Trophy className="w-3 h-3" />
          {streak.longest_streak}
        </div>
      )}
    </div>
  );
};
