import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { MembersSidebar } from '@/components/members/MembersSidebar';
import { MembersHeader } from '@/components/members/MembersHeader';
import { MobileTouchNav } from '@/components/members/MobileTouchNav';
import '@/styles/touch.css';
import { shouldSuspendMemberLayout } from '@/lib/memberAccessState';
import { OnboardingDialog } from '@/components/members/OnboardingDialog';
import { useAchievementChecker } from '@/hooks/useAchievementChecker';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

interface MembersLayoutProps {
  children: React.ReactNode;
}

export const MembersLayout = ({ children }: MembersLayoutProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState(false);
  // Repeated SIGNED_IN and TOKEN_REFRESHED events for the same verified user must not unmount the lesson.
  const verifiedUserId = useRef<string | null>(null);

  // Hook must be called unconditionally before any returns
  useAchievementChecker(user?.id);

  useEffect(() => {
    let disposed = false;
    let generation = 0;
    const checkAccess = async (session: Session | null) => {
      const request = ++generation;
      const sameVerifiedUser = !shouldSuspendMemberLayout(verifiedUserId.current, session?.user.id ?? null);
      if (!sameVerifiedUser) { setLoading(true); setUser(null); }
      setAccessError(false);
      if (!session) { verifiedUserId.current = null; navigate('/auth', { replace: true }); setLoading(false); return; }
      try {
        const { data: profile, error } = await supabase.from('profiles').select('access_status').eq('id', session.user.id).single();
        if (disposed || request !== generation) return;
        if (error || !profile) { verifiedUserId.current = null; setUser(null); setAccessError(true); return; }
        if (profile.access_status === 'revoked') { verifiedUserId.current = null; setUser(null); navigate('/acesso-bloqueado', { replace: true }); return; }
        verifiedUserId.current = session.user.id;
        if (!sameVerifiedUser) setUser(session.user);
      } catch {
        if (!disposed && request === generation) { verifiedUserId.current = null; setUser(null); setAccessError(true); }
      } finally {
        if (!disposed && request === generation) setLoading(false);
      }
    };
    const pending = new Set<ReturnType<typeof setTimeout>>();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const timer = setTimeout(() => { pending.delete(timer); if (!disposed) void checkAccess(session); }, 0);
      pending.add(timer);
    });
    return () => { disposed = true; generation++; pending.forEach(clearTimeout); subscription.unsubscribe(); };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (accessError) return (
    <div className="min-h-screen grid place-items-center p-6" role="alert">
      <div><p>Não foi possível verificar seu acesso.</p><button className="underline mt-4" onClick={() => window.location.reload()}>Tentar novamente</button></div>
    </div>
  );
  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="touch-shell min-h-svh flex w-full bg-background">
        <MembersSidebar />
        <div className="min-w-0 flex-1 flex flex-col">
          <MembersHeader user={user} />
          <main className="touch-main min-w-0 flex-1 overflow-x-clip overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <MobileTouchNav />
      </div>
      <OnboardingDialog userId={user.id} />
    </SidebarProvider>
  );
};
