import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export const useStreak = (userId?: string) => {
  const [streak, setStreak] = useState<StreakData>({ current_streak: 0, longest_streak: 0, last_activity_date: null });
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const recordActivity = useCallback(async () => {
    if (!userId) return;

    const { data: existing } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existing) {
      const { data } = await supabase
        .from('user_streaks')
        .insert({ user_id: userId, current_streak: 1, longest_streak: 1, last_activity_date: today })
        .select()
        .single();
      if (data) setStreak({ current_streak: 1, longest_streak: 1, last_activity_date: today });
      return;
    }

    if (existing.last_activity_date === today) return; // Already recorded today

    const lastDate = existing.last_activity_date ? new Date(existing.last_activity_date) : null;
    const todayDate = new Date(today);

    let newStreak = 1;
    if (lastDate) {
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak = (existing.current_streak || 0) + 1;
      }
    }

    const newLongest = Math.max(newStreak, existing.longest_streak || 0);

    const { data } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (data) {
      setStreak({
        current_streak: data.current_streak,
        longest_streak: data.longest_streak,
        last_activity_date: data.last_activity_date,
      });
    }
  }, [userId, today]);

  useEffect(() => {
    if (!userId) return;

    const fetchStreak = async () => {
      const { data } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        // Check if streak is still valid
        const lastDate = data.last_activity_date ? new Date(data.last_activity_date) : null;
        const todayDate = new Date(today);
        if (lastDate) {
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            setStreak({ current_streak: 0, longest_streak: data.longest_streak, last_activity_date: data.last_activity_date });
          } else {
            setStreak(data);
          }
        } else {
          setStreak(data);
        }
      }
      setLoading(false);
    };

    fetchStreak();
    recordActivity();
  }, [userId, recordActivity, today]);

  return { streak, loading };
};
