import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isTrackKey, type TrackKey } from '@/lib/curriculum';
import { useAuthUser } from './useAuthUser';
import { certificateStatusKey } from './useCertificate';

export const learningTrackKey = (userId: string | undefined) => ['learning-track', userId ?? null] as const;

/** `profiles.learning_track`; null until the learner picks a track. */
export function useLearningTrack() {
  const { data: user } = useAuthUser();
  const userId = user?.id;
  return useQuery({
    queryKey: learningTrackKey(userId),
    queryFn: async (): Promise<TrackKey | null> => {
      if (!userId) return null;
      const { data, error } = await supabase.from('profiles').select('learning_track').eq('id', userId).maybeSingle();
      if (error) {
        console.error('[useLearningTrack] could not load the learning track', error);
        throw error;
      }
      return isTrackKey(data?.learning_track) ? data.learning_track : null;
    },
    enabled: Boolean(userId),
  });
}

export function useSaveLearningTrack() {
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();
  const userId = user?.id;
  return useMutation({
    mutationFn: async (track: TrackKey) => {
      if (!userId) throw new Error('Sessão expirada. Entre novamente.');
      const { data, error } = await supabase
        .from('profiles')
        .update({ learning_track: track })
        .eq('id', userId)
        .select('learning_track')
        .maybeSingle();
      if (error) throw error;
      // RLS turns a refused update into "0 rows" instead of an error.
      if (!data) throw new Error('Profile not updated');
      return track;
    },
    onSuccess: (track) => {
      queryClient.setQueryData(learningTrackKey(userId), track);
      void queryClient.invalidateQueries({ queryKey: certificateStatusKey(userId) });
    },
    onError: (error) => console.error('[useSaveLearningTrack] could not save the learning track', error),
  });
}
