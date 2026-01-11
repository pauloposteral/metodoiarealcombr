import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPoints {
  points: number;
  level: number;
  posts_count: number;
  comments_count: number;
  likes_received: number;
  lessons_completed: number;
}

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

interface LeaderboardUser {
  user_id: string;
  points: number;
  level: number;
  full_name: string | null;
  avatar_url: string | null;
  badges_count: number;
}

export function useGamification(userId?: string) {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  const calculateLevel = (points: number): number => {
    if (points < 50) return 1;
    if (points < 150) return 2;
    if (points < 300) return 3;
    if (points < 500) return 4;
    if (points < 800) return 5;
    if (points < 1200) return 6;
    if (points < 1800) return 7;
    if (points < 2500) return 8;
    if (points < 3500) return 9;
    return 10;
  };

  const getLevelTitle = (level: number): string => {
    const titles = [
      'Iniciante',
      'Aprendiz',
      'Estudante',
      'Praticante',
      'Conhecedor',
      'Especialista',
      'Expert',
      'Mestre',
      'Grão-Mestre',
      'Lenda'
    ];
    return titles[Math.min(level - 1, 9)];
  };

  const fetchUserPoints = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setUserPoints({
        points: data.points,
        level: calculateLevel(data.points),
        posts_count: data.posts_count,
        comments_count: data.comments_count,
        likes_received: data.likes_received,
        lessons_completed: data.lessons_completed
      });
    } else {
      setUserPoints({
        points: 0,
        level: 1,
        posts_count: 0,
        comments_count: 0,
        likes_received: 0,
        lessons_completed: 0
      });
    }
  };

  const fetchBadges = async () => {
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .order('points_required');

    if (allBadges) {
      setBadges(allBadges);
    }

    if (userId) {
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at, badges(*)')
        .eq('user_id', userId);

      if (userBadges) {
        const earned = userBadges.map(ub => ({
          ...(ub.badges as any),
          earned_at: ub.earned_at
        }));
        setEarnedBadges(earned);
      }
    }
  };

  const fetchLeaderboard = async () => {
    const { data: pointsData } = await supabase
      .from('user_points')
      .select('user_id, points, level')
      .order('points', { ascending: false })
      .limit(10);

    if (pointsData && pointsData.length > 0) {
      const userIds = pointsData.map(p => p.user_id);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      profiles?.forEach(p => {
        profilesMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
      });

      // Get badge counts
      const { data: badgeCounts } = await supabase
        .from('user_badges')
        .select('user_id')
        .in('user_id', userIds);

      const badgeCountMap: Record<string, number> = {};
      badgeCounts?.forEach(b => {
        badgeCountMap[b.user_id] = (badgeCountMap[b.user_id] || 0) + 1;
      });

      const leaderboardData: LeaderboardUser[] = pointsData.map(p => ({
        user_id: p.user_id,
        points: p.points,
        level: calculateLevel(p.points),
        full_name: profilesMap[p.user_id]?.full_name || null,
        avatar_url: profilesMap[p.user_id]?.avatar_url || null,
        badges_count: badgeCountMap[p.user_id] || 0
      }));

      setLeaderboard(leaderboardData);

      // Find user rank
      if (userId) {
        const rank = leaderboardData.findIndex(u => u.user_id === userId);
        if (rank !== -1) {
          setUserRank(rank + 1);
        } else {
          // User not in top 10, find their actual rank
          const { count } = await supabase
            .from('user_points')
            .select('*', { count: 'exact', head: true })
            .gt('points', userPoints?.points || 0);
          
          setUserRank((count || 0) + 1);
        }
      }
    }
  };

  const checkAndAwardBadges = async () => {
    if (!userId || !userPoints) return;

    const eligibleBadges = badges.filter(badge => {
      const alreadyEarned = earnedBadges.some(eb => eb.id === badge.id);
      if (alreadyEarned) return false;

      // Check eligibility based on badge criteria
      switch (badge.icon) {
        case 'play':
          return userPoints.lessons_completed >= 1;
        case 'book-open':
          return userPoints.lessons_completed >= 10;
        case 'graduation-cap':
          return userPoints.lessons_completed >= 30; // Assuming 30 lessons total
        case 'message-circle':
          return userPoints.posts_count >= 1;
        case 'pen-tool':
          return userPoints.posts_count >= 5;
        case 'heart':
          return userPoints.likes_received >= 10;
        case 'star':
          return userPoints.likes_received >= 50;
        case 'message-square':
          return userPoints.comments_count >= 10;
        case 'messages-square':
          return userPoints.comments_count >= 25;
        case 'crown':
          return userPoints.points >= 1000;
        default:
          return userPoints.points >= badge.points_required;
      }
    });

    for (const badge of eligibleBadges) {
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id
      });
    }

    if (eligibleBadges.length > 0) {
      fetchBadges();
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserPoints(),
        fetchBadges(),
        fetchLeaderboard()
      ]);
      setLoading(false);
    };

    fetchAll();
  }, [userId]);

  useEffect(() => {
    if (userPoints && badges.length > 0) {
      checkAndAwardBadges();
    }
  }, [userPoints, badges]);

  return {
    userPoints,
    badges,
    earnedBadges,
    leaderboard,
    loading,
    userRank,
    calculateLevel,
    getLevelTitle,
    refetch: () => {
      fetchUserPoints();
      fetchBadges();
      fetchLeaderboard();
    }
  };
}
