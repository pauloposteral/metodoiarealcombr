import { Trophy, Medal, Award, Crown, Flame } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface LeaderboardUser {
  user_id: string;
  points: number;
  level: number;
  full_name: string | null;
  avatar_url: string | null;
  badges_count: number;
}

interface LeaderboardCardProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  userRank?: number | null;
}

export function LeaderboardCard({ users, currentUserId, userRank }: LeaderboardCardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30';
      default:
        return 'bg-card border-border/50';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold" />
          <h3 className="font-display font-bold text-lg text-foreground">Ranking</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          <Flame className="w-3 h-3 mr-1" />
          Top 10
        </Badge>
      </div>

      <div className="space-y-2">
        {users.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.user_id === currentUserId;
          
          return (
            <div
              key={user.user_id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${getRankStyle(rank)} ${
                isCurrentUser ? 'ring-2 ring-accent/50' : ''
              }`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(rank)}
              </div>
              
              <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-accent/10 text-accent font-bold text-sm">
                  {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isCurrentUser ? 'text-accent' : 'text-foreground'}`}>
                  {user.full_name || 'Usuário'}
                  {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(você)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  Nível {user.level} • {user.badges_count} badges
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-accent">{user.points}</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          );
        })}
      </div>

      {userRank && userRank > 10 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-sm text-center text-muted-foreground">
            Sua posição: <span className="font-bold text-accent">#{userRank}</span>
          </p>
        </div>
      )}

      {users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum participante ainda</p>
          <p className="text-sm">Seja o primeiro a pontuar!</p>
        </div>
      )}
    </div>
  );
}
