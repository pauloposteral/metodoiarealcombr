import { Zap, MessageSquare, Heart, BookOpen, TrendingUp, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UserPoints {
  points: number;
  level: number;
  posts_count: number;
  comments_count: number;
  likes_received: number;
  lessons_completed: number;
}

interface UserPointsCardProps {
  userPoints: UserPoints | null;
  getLevelTitle: (level: number) => string;
  userRank?: number | null;
}

export function UserPointsCard({ userPoints, getLevelTitle, userRank }: UserPointsCardProps) {
  if (!userPoints) {
    return (
      <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-6 border border-accent/20">
        <div className="text-center py-8">
          <Zap className="w-12 h-12 mx-auto mb-3 text-accent opacity-50" />
          <p className="text-muted-foreground">Comece a participar para ganhar pontos!</p>
        </div>
      </div>
    );
  }

  const level = userPoints.level;
  const levelTitle = getLevelTitle(level);
  
  // Calculate progress to next level
  const levelThresholds = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000];
  const currentThreshold = levelThresholds[level - 1] || 0;
  const nextThreshold = levelThresholds[level] || 5000;
  const progressToNext = ((userPoints.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  const stats = [
    { icon: BookOpen, label: 'Aulas', value: userPoints.lessons_completed, color: 'text-blue-500' },
    { icon: MessageSquare, label: 'Posts', value: userPoints.posts_count, color: 'text-purple-500' },
    { icon: Heart, label: 'Curtidas', value: userPoints.likes_received, color: 'text-red-500' },
    { icon: TrendingUp, label: 'Comentários', value: userPoints.comments_count, color: 'text-green-500' },
  ];

  return (
    <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-6 border border-accent/20">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-gold fill-gold" />
            <span className="text-sm font-medium text-muted-foreground">Nível {level}</span>
          </div>
          <h3 className="font-display font-bold text-2xl text-foreground">{levelTitle}</h3>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-accent">{userPoints.points}</p>
          <p className="text-xs text-muted-foreground">pontos totais</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Progresso para o próximo nível</span>
          <span className="text-xs font-medium text-accent">
            {userPoints.points - currentThreshold} / {nextThreshold - currentThreshold}
          </span>
        </div>
        <Progress value={Math.min(progressToNext, 100)} className="h-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center p-3 bg-background/50 rounded-xl">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="font-bold text-lg text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {userRank && (
        <div className="mt-4 pt-4 border-t border-accent/20 text-center">
          <p className="text-sm text-muted-foreground">
            Você está em <span className="font-bold text-accent">#{userRank}º</span> no ranking geral
          </p>
        </div>
      )}
    </div>
  );
}
