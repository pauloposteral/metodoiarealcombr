import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { MembersSidebar } from '@/components/members/MembersSidebar';
import { MembersHeader } from '@/components/members/MembersHeader';
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

  // Hook must be called unconditionally before any returns
  useAchievementChecker(user?.id);

  useEffect(() => {
    let disposed = false;
    let generation = 0;
    const checkAccess = async (session: Session | null) => {
      const request = ++generation;
      setLoading(true); setAccessError(false); setUser(null);
      if (!session) { navigate('/auth', { replace: true }); setLoading(false); return; }
      try {
        const { data: profile, error } = await supabase.from('profiles').select('access_status').eq('id', session.user.id).single();
        if (disposed || request !== generation) return;
        if (error || !profile) { setAccessError(true); return; }
        if (profile.access_status === 'revoked') { navigate('/acesso-bloqueado', { replace: true }); return; }
        setUser(session.user);
      } catch {
        if (!disposed && request === generation) setAccessError(true);
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
      <div className="min-h-screen flex w-full bg-background">
        <MembersSidebar />
        <div className="flex-1 flex flex-col">
          <MembersHeader user={user} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <OnboardingDialog userId={user.id} />
    </SidebarProvider>
  );
};
