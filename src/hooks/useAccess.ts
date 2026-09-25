import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AccessStatus = 'loading' | 'guest' | 'member' | 'admin' | 'blocked';

/** Single source of truth: access_status (not payments) + admin role. */
export function useAccess() {
  const [status, setStatus] = useState<AccessStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let gen = 0;
    const resolve = async (u: User | null) => {
      const g = ++gen;
      setUser(u);
      if (!u) { setStatus('guest'); setName(null); return; }
      const [{ data: profile }, { data: isAdmin }] = await Promise.all([
        supabase.from('profiles').select('access_status, full_name').eq('id', u.id).maybeSingle(),
        supabase.rpc('has_role', { _user_id: u.id, _role: 'admin' }),
      ]);
      if (!alive || g !== gen) return;
      setName(profile?.full_name ?? u.email ?? null);
      if (isAdmin) setStatus('admin');
      else if (profile?.access_status === 'active') setStatus('member');
      else if (profile?.access_status === 'revoked') setStatus('blocked');
      else setStatus('guest');
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setTimeout(() => { if (alive) void resolve(session?.user ?? null); }, 0);
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  return { status, user, name, hasAccess: status === 'member' || status === 'admin' };
}
