import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';
import { HttpError, requireEnv } from './http.ts';

export function adminClient() {
  return createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireUser(req: Request) {
  const authorization = req.headers.get('authorization');
  if (!authorization?.match(/^Bearer\s+\S+$/i)) throw new HttpError(401, 'Faça login para continuar.');
  const client = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(authorization.replace(/^Bearer\s+/i, ''));
  if (error || !data.user) throw new HttpError(401, 'Sessão inválida. Entre novamente.');
  if (!data.user.email_confirmed_at) throw new HttpError(403, 'Confirme seu e-mail para continuar.');
  return { user: data.user, client };
}
