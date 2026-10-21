import { useQuery, type QueryClient, useQueryClient } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { clearAccountDrafts } from '@/lib/accountDrafts';

export const AUTH_USER_QUERY_KEY = ['auth-user'] as const;

const syncedClients = new WeakSet<QueryClient>();

/** Keeps the cached user in step with sign-in/sign-out in any tab (one listener per client). */
function syncAuthUser(queryClient: QueryClient) {
  if (syncedClients.has(queryClient)) return;
  syncedClients.add(queryClient);
  supabase.auth.onAuthStateChange((_event, session) => {
    const next = session?.user ?? null;
    const previous = queryClient.getQueryData<User | null>(AUTH_USER_QUERY_KEY);
    if (typeof window !== 'undefined') {
      try {
        if (_event === 'SIGNED_OUT') clearAccountDrafts(window.sessionStorage);
        else if (previous?.id && previous.id !== next?.id) clearAccountDrafts(window.sessionStorage, previous.id);
      } catch { /* Storage may be disabled; authentication must continue. */ }
    }
    if (previous?.id !== next?.id) queryClient.setQueryData(AUTH_USER_QUERY_KEY, next);
  });
}

/**
 * Signed-in user from the local session. The members layout already enforces access; this
 * only provides the id that scopes the learning queries.
 */
export function useAuthUser() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: async () => {
      syncAuthUser(queryClient);
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session?.user ?? null;
    },
    staleTime: Infinity,
  });
}
