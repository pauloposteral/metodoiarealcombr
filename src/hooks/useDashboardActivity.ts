import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthUser } from './useAuthUser';

export interface RecentLesson {
  id: string;
  title: string;
  completedAt: string | null;
}

export interface DashboardActivity {
  fullName: string | null;
  recentLessons: RecentLesson[];
  achievements: number;
}

/** Profile name, last completed lessons and achievement count for the members home. */
export function useDashboardActivity() {
  const { data: user } = useAuthUser();
  const userId = user?.id;
  return useQuery({
    queryKey: ['dashboard-activity', userId ?? null],
    queryFn: async (): Promise<DashboardActivity> => {
      const id = userId ?? '';
      const [profile, recent, achievements] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', id).maybeSingle(),
        supabase
          .from('lesson_progress')
          .select('lesson_id, completed_at, lessons(title)')
          .eq('user_id', id)
          .eq('completed', true)
          .order('completed_at', { ascending: false })
          .limit(5),
        supabase.from('user_achievements').select('id', { count: 'exact', head: true }).eq('user_id', id),
      ]);
      const error = profile.error ?? recent.error ?? achievements.error;
      if (error) {
        console.error('[useDashboardActivity] could not load activity', error);
        throw error;
      }
      return {
        fullName: profile.data?.full_name?.trim() || null,
        recentLessons: (recent.data ?? []).map((row) => ({ id: row.lesson_id, title: row.lessons?.title ?? 'Aula', completedAt: row.completed_at })),
        achievements: achievements.count ?? 0,
      };
    },
    enabled: Boolean(userId),
  });
}
