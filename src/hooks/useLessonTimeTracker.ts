import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TimeTrackerProps {
  lessonId: string;
  userId: string;
}

export const useLessonTimeTracker = ({ lessonId, userId }: TimeTrackerProps) => {
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();

    // Record start
    supabase.from('lesson_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      started_at: new Date().toISOString(),
      status: 'in_progress',
    }, { onConflict: 'user_id,lesson_id' }).then(() => {});

    // Save time every 30 seconds
    intervalRef.current = setInterval(async () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      await supabase
        .from('lesson_progress')
        .update({ time_spent_seconds: elapsed })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);
    }, 30000);

    return () => {
      // Save final time on unmount
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      supabase
        .from('lesson_progress')
        .update({ time_spent_seconds: elapsed })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .then(() => {});

      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lessonId, userId]);
};
