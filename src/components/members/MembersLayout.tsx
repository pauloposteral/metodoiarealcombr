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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
        setLoading(false);
        return;
      }

      // Check access status
      supabase
        .from('profiles')
        .select('access_status')
        .eq('id', session.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.access_status === 'revoked') {
            navigate('/acesso-bloqueado');
          }
          setLoading(false);
        });
    });

    return () => subscription.unsubscribe();
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

  // Achievement checker runs on every members page load
  useAchievementChecker(user?.id);

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
