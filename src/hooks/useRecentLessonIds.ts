import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthUser } from './useAuthUser';

/** The existing tracker updates started_at when a lesson is opened. This read does not write progress. */
export function useRecentLessonIds() {
  const { data: user } = useAuthUser();
  return useQuery({
    queryKey: ['recent-lesson-ids', user?.id ?? null],
    enabled: Boolean(user?.id),
    staleTime: 0,
    retry: 1,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.from('lesson_progress').select('lesson_id, started_at').eq('user_id', user?.id ?? '').not('started_at', 'is', null).order('started_at', { ascending: false, nullsFirst: false }).limit(20);
      if (error) throw error;
      return (data ?? []).map(row => row.lesson_id);
    },
  });
}
