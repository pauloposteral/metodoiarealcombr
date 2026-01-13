import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { MetodoSidebar } from '@/components/metodo/MetodoSidebar';
import { MetodoHeader } from '@/components/metodo/MetodoHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

interface CompanyData {
  id: string;
  name: string;
  plan: string;
  status: string;
}

interface CompanyUserData {
  role: string;
  company: CompanyData;
}

export default function MetodoApp() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyUserData | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/metodo/login');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/metodo/login');
        setLoading(false);
        return;
      }

      // Fetch company data
      setTimeout(() => {
        fetchCompanyData(session.user.id);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCompanyData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          role,
          companies (
            id,
            name,
            plan,
            status
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data || !data.companies) {
        navigate('/metodo/login');
        return;
      }

      // Check if company is active
      const company = data.companies as unknown as CompanyData;
      if (company.status !== 'active') {
        navigate('/metodo/acesso-pendente');
        return;
      }

      setCompanyData({
        role: data.role,
        company
      });
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!user || !companyData) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MetodoSidebar 
          companyName={companyData.company.name} 
          userRole={companyData.role}
          plan={companyData.company.plan}
        />
        <div className="flex-1 flex flex-col">
          <MetodoHeader user={user} companyName={companyData.company.name} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <Outlet context={{ user, companyData }} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
