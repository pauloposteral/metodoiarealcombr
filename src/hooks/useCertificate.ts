import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { databaseRpcSingle } from '@/lib/databaseRpc';
import type { CertificateStatus } from '@/lib/curriculum';
import { useAuthUser } from './useAuthUser';

export type IssuedCertificate = Tables<'certificates'>;

export const certificateStatusKey = (userId: string | undefined) => ['certificate-status', userId ?? null] as const;
export const issuedCertificateKey = (userId: string | undefined) => ['issued-certificate', userId ?? null] as const;

/** `get_certificate_status()`: track, lessons done vs required and the final project. */
export function useCertificateStatus() {
  const { data: user } = useAuthUser();
  return useQuery({
    queryKey: certificateStatusKey(user?.id),
    queryFn: async () => {
      const { data, error } = await databaseRpcSingle<CertificateStatus>('get_certificate_status');
      if (error || !data) {
        console.error('[useCertificateStatus] could not load the certificate status', error);
        throw error ?? new Error('Certificate status unavailable');
      }
      return data;
    },
    enabled: Boolean(user),
  });
}

export function useIssuedCertificate() {
  const { data: user } = useAuthUser();
  const userId = user?.id;
  return useQuery({
    queryKey: issuedCertificateKey(userId),
    queryFn: async (): Promise<IssuedCertificate | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at')
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('[useIssuedCertificate] could not load the certificate', error);
        throw error;
      }
      return data;
    },
    enabled: Boolean(userId),
  });
}

/** `issue_certificate()` applies the track rule server-side and returns the (possibly existing) certificate. */
export function useIssueCertificate() {
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await databaseRpcSingle<IssuedCertificate>('issue_certificate');
      if (error || !data) throw error ?? new Error('Certificate was not returned');
      return data;
    },
    onSuccess: (certificate) => {
      queryClient.setQueryData(issuedCertificateKey(user?.id), certificate);
      void queryClient.invalidateQueries({ queryKey: certificateStatusKey(user?.id) });
    },
    onError: (error) => console.error('[useIssueCertificate] could not issue the certificate', error),
  });
}

/** `profiles.full_name`: the name printed on the certificate. */
export function useProfileName() {
  const { data: user } = useAuthUser();
  const userId = user?.id;
  return useQuery({
    queryKey: ['profile-name', userId ?? null],
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase.from('profiles').select('full_name').eq('id', userId ?? '').maybeSingle();
      if (error) {
        console.error('[useProfileName] could not load the profile name', error);
        throw error;
      }
      return data?.full_name?.trim() || null;
    },
    enabled: Boolean(userId),
  });
}
