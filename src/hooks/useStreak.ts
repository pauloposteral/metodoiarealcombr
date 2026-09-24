import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
interface StreakData { current_streak: number; longest_streak: number; last_activity_date: string | null; }
export const useStreak = (userId?: string) => {
  const [streak, setStreak] = useState<StreakData>({ current_streak: 0, longest_streak: 0, last_activity_date: null });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    supabase.rpc('record_study_day').single().then(({ data, error }) => {
      if (cancelled) return;
      if (!error && data) setStreak(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [userId]);
  return { streak, loading };
};
