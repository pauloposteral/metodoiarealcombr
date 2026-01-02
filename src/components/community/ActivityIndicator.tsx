import { Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityIndicatorProps {
  stats: {
    totalPosts: number;
    todayPosts: number;
    totalComments: number;
    activeMembers: number;
  };
}

export const ActivityIndicator = ({ stats }: ActivityIndicatorProps) => {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-gold" />
          Atividade da Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-background/50 text-center">
            <p className="text-2xl font-bold text-gold">{stats.totalPosts}</p>
            <p className="text-xs text-muted-foreground">Publicações</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50 text-center">
            <p className="text-2xl font-bold text-gold">{stats.totalComments}</p>
            <p className="text-xs text-muted-foreground">Comentários</p>
          </div>
        </div>
        
        {stats.todayPosts > 0 && (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>{stats.todayPosts} novas publicações hoje</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
