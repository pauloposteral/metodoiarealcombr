import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { ProjectSubmissionValues } from '@/lib/projectSubmission';
import { useAuthUser } from './useAuthUser';
import { certificateStatusKey } from './useCertificate';
import { completedLessonsKey } from './useCourseOutline';

const LESSON_COLUMNS = 'id, module_id, title, description, video_url, duration_minutes, estimated_minutes, order_index, content, prompts, type, reviewed_at';

export type LessonRow = Pick<
  Tables<'lessons'>,
  'id' | 'module_id' | 'title' | 'description' | 'video_url' | 'duration_minutes' | 'estimated_minutes' | 'order_index' | 'content' | 'prompts' | 'type' | 'reviewed_at'
>;
export type ProjectSubmissionRow = Tables<'project_submissions'>;

/** The lesson row; null when it does not exist or RLS keeps it closed for the learner's plan. */
export function useLesson(lessonId: string | undefined) {
  const { data: user } = useAuthUser();
  return useQuery({
    queryKey: ['lesson', user?.id ?? null, lessonId ?? null],
    queryFn: async (): Promise<LessonRow | null> => {
      const { data, error } = await supabase.from('lessons').select(LESSON_COLUMNS).eq('id', lessonId ?? '').maybeSingle();
      if (error) {
        console.error('[useLesson] could not load lesson', lessonId, error);
        throw error;
      }
      return data;
    },
    enabled: Boolean(user && lessonId),
  });
}

const bookmarkKey = (userId: string | undefined, lessonId: string) => ['lesson-bookmark', userId ?? null, lessonId] as const;

export function useLessonBookmark(lessonId: string) {
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();
  const userId = user?.id;
  const query = useQuery({
    queryKey: bookmarkKey(userId, lessonId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_bookmarks')
        .select('id')
        .eq('user_id', userId ?? '')
        .eq('lesson_id', lessonId)
        .maybeSingle();
      if (error) {
        console.error('[useLessonBookmark] could not load bookmark', lessonId, error);
        throw error;
      }
      return Boolean(data);
    },
    enabled: Boolean(userId),
  });
  const toggle = useMutation({
    mutationFn: async (bookmarked: boolean) => {
      if (!userId) throw new Error('Not signed in');
      const { error } = bookmarked
        ? await supabase.from('lesson_bookmarks').insert({ user_id: userId, lesson_id: lessonId })
        : await supabase.from('lesson_bookmarks').delete().eq('user_id', userId).eq('lesson_id', lessonId);
      if (error) throw error;
      return bookmarked;
    },
    onSuccess: (bookmarked) => queryClient.setQueryData(bookmarkKey(userId, lessonId), bookmarked),
    onError: (error) => console.error('[useLessonBookmark] could not update bookmark', lessonId, error),
  });
  return { isBookmarked: query.data === true, isReady: query.isSuccess, toggle };
}

const submissionKey = (userId: string | undefined, lessonId: string) => ['project-submission', userId ?? null, lessonId] as const;

/** The learner's delivery for a project lesson (`project_submissions`, one per lesson). */
export function useProjectSubmission(lessonId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();
  const userId = user?.id;
  const query = useQuery({
    queryKey: submissionKey(userId, lessonId),
    queryFn: async (): Promise<ProjectSubmissionRow | null> => {
      const { data, error } = await supabase
        .from('project_submissions')
        .select('*')
        .eq('user_id', userId ?? '')
        .eq('lesson_id', lessonId)
        .maybeSingle();
      if (error) {
        console.error('[useProjectSubmission] could not load submission', lessonId, error);
        throw error;
      }
      return data;
    },
    enabled: Boolean(userId) && enabled,
  });
  const save = useMutation({
    mutationFn: async (values: ProjectSubmissionValues) => {
      if (!userId) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('project_submissions')
        .upsert(
          { user_id: userId, lesson_id: lessonId, url: values.url, notes: values.notes, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,lesson_id' },
        )
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (submission) => {
      queryClient.setQueryData(submissionKey(userId, lessonId), submission);
      void queryClient.invalidateQueries({ queryKey: certificateStatusKey(userId) });
    },
    onError: (error) => console.error('[useProjectSubmission] could not save submission', lessonId, error),
  });
  return { submission: query.data ?? null, isLoading: query.isPending && enabled, isError: query.isError, save };
}

/** Marks a lesson as completed and updates the cached progress. */
export function useCompleteLesson() {
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();
  const userId = user?.id;
  return useMutation({
    mutationFn: async (lessonId: string) => {
      if (!userId) throw new Error('Not signed in');
      const { error } = await supabase.from('lesson_progress').upsert(
        { user_id: userId, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString(), status: 'completed' },
        { onConflict: 'user_id,lesson_id' },
      );
      if (error) throw error;
      return lessonId;
    },
    onSuccess: (lessonId) => {
      queryClient.setQueryData<ReadonlySet<string>>(completedLessonsKey(userId), (previous) => new Set([...(previous ?? []), lessonId]));
      void queryClient.invalidateQueries({ queryKey: certificateStatusKey(userId) });
    },
    onError: (error) => console.error('[useCompleteLesson] could not save progress', error),
  });
}
