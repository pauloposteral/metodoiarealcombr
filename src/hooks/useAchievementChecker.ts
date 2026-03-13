import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AchievementCriteria {
  type: string;
  count: number;
}

export const useAchievementChecker = (userId?: string) => {
  const checkedRef = useRef(false);

  const checkAchievements = useCallback(async () => {
    if (!userId || checkedRef.current) return;
    checkedRef.current = true;

    try {
      // Fetch all achievements and user's earned ones in parallel
      const [achievementsRes, earnedRes, pointsRes, streakRes] = await Promise.all([
        supabase.from('achievements').select('*'),
        supabase.from('user_achievements').select('achievement_id').eq('user_id', userId),
        supabase.from('user_points').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', userId).maybeSingle(),
      ]);

      const achievements = achievementsRes.data || [];
      const earnedIds = new Set((earnedRes.data || []).map(e => e.achievement_id));
      const points = pointsRes.data;
      const streak = streakRes.data;

      if (!points && !streak) return;

      const newlyEarned: { title: string; description: string; icon: string; points: number }[] = [];

      for (const achievement of achievements) {
        if (earnedIds.has(achievement.id)) continue;

        const criteria = achievement.criteria as AchievementCriteria;
        let eligible = false;

        switch (criteria.type) {
          case 'lessons_completed':
            eligible = (points?.lessons_completed || 0) >= criteria.count;
            break;
          case 'posts_count':
            eligible = (points?.posts_count || 0) >= criteria.count;
            break;
          case 'comments_count':
            eligible = (points?.comments_count || 0) >= criteria.count;
            break;
          case 'points':
            eligible = (points?.points || 0) >= criteria.count;
            break;
          case 'streak':
            eligible = (streak?.longest_streak || 0) >= criteria.count;
            break;
        }

        if (eligible) {
          const { error } = await supabase.from('user_achievements').insert({
            user_id: userId,
            achievement_id: achievement.id,
          });

          if (!error) {
            newlyEarned.push({
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
              points: achievement.points || 0,
            });
          }
        }
      }

      // Show toast for each new achievement (staggered)
      newlyEarned.forEach((a, i) => {
        setTimeout(() => {
          toast({
            title: `🏆 Conquista desbloqueada!`,
            description: `${a.title} — ${a.description} (+${a.points} pts)`,
          });
        }, i * 1500);
      });
    } catch (error) {
      console.error('Achievement check error:', error);
    }
  }, [userId]);

  useEffect(() => {
    // Delay check to let other data load first
    const timer = setTimeout(checkAchievements, 2000);
    return () => clearTimeout(timer);
  }, [checkAchievements]);

  // Allow re-checking (e.g. after completing a lesson)
  const recheck = useCallback(() => {
    checkedRef.current = false;
    checkAchievements();
  }, [checkAchievements]);

  return { recheckAchievements: recheck };
};
