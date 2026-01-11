import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { useGamification } from '@/hooks/useGamification';
import { LeaderboardCard } from '@/components/gamification/LeaderboardCard';
import { UserPointsCard } from '@/components/gamification/UserPointsCard';
import { BadgesDisplay } from '@/components/gamification/BadgesDisplay';
import { Trophy, Star, Target, Zap } from 'lucide-react';

const MembersRanking = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const { 
    userPoints, 
    badges, 
    earnedBadges, 
    leaderboard, 
    userRank,
    getLevelTitle,
    loading: gamificationLoading 
  } = useGamification(userId);

  if (loading || gamificationLoading) {
    return (
      <MembersLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-gold animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando ranking...</p>
          </div>
        </div>
      </MembersLayout>
    );
  }

  return (
    <MembersLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-8 h-8 text-gold" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              Ranking da Comunidade
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ganhe pontos completando aulas, fazendo posts, comentando e recebendo curtidas. 
            Conquiste badges e suba no ranking!
          </p>
        </div>

        {/* Points System Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Target, label: 'Completar aula', points: '+10', color: 'text-blue-500' },
            { icon: Zap, label: 'Criar post', points: '+15', color: 'text-purple-500' },
            { icon: Star, label: 'Comentar', points: '+5', color: 'text-green-500' },
            { icon: Trophy, label: 'Receber curtida', points: '+3', color: 'text-gold' },
          ].map((item) => (
            <div 
              key={item.label}
              className="bg-card rounded-xl p-4 border border-border/50 text-center"
            >
              <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
              <p className="font-bold text-accent">{item.points}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Stats */}
          <div className="lg:col-span-2 space-y-6">
            <UserPointsCard 
              userPoints={userPoints} 
              getLevelTitle={getLevelTitle}
              userRank={userRank}
            />
            <BadgesDisplay 
              allBadges={badges} 
              earnedBadges={earnedBadges} 
            />
          </div>

          {/* Leaderboard */}
          <div>
            <LeaderboardCard 
              users={leaderboard} 
              currentUserId={userId}
              userRank={userRank}
            />
          </div>
        </div>

        {/* How to earn more points */}
        <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-8 text-primary-foreground">
          <h2 className="font-display font-bold text-xl mb-4">Como ganhar mais pontos?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gold mb-2">📚 Progresso no Curso</h3>
              <ul className="text-sm text-primary-foreground/80 space-y-1">
                <li>• Complete aulas para ganhar 10 pontos cada</li>
                <li>• Termine módulos inteiros para badges especiais</li>
                <li>• Complete o curso todo para o badge máximo</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gold mb-2">💬 Engajamento na Comunidade</h3>
              <ul className="text-sm text-primary-foreground/80 space-y-1">
                <li>• Crie posts com dúvidas ou resultados (+15 pts)</li>
                <li>• Comente e ajude outros alunos (+5 pts)</li>
                <li>• Receba curtidas por contribuições úteis (+3 pts)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MembersLayout>
  );
};

export default MembersRanking;
