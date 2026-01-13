import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Building2, 
  FileText, 
  TrendingUp,
  Activity,
  DollarSign,
  UserPlus,
  Clock,
  Loader2
} from 'lucide-react';

interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalLeads: number;
  pendingLeads: number;
  totalPurchases: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    totalLeads: 0,
    pendingLeads: 0,
    totalPurchases: 0,
    recentActivity: [],
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/admin/login');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/admin/login');
        setLoading(false);
        return;
      }

      // Verify admin role
      setTimeout(() => {
        verifyAdminAndLoadStats(session.user.id);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const verifyAdminAndLoadStats = async (userId: string) => {
    try {
      // Check admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) throw roleError;

      if (!roleData) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      // Load dashboard stats
      await loadDashboardStats();
    } catch (error) {
      console.error('Error verifying admin:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Fetch companies count
      const { count: totalCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      const { count: activeCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch users count
      const { count: totalUsers } = await supabase
        .from('company_users')
        .select('*', { count: 'exact', head: true });

      // Fetch leads count
      const { count: totalLeads } = await supabase
        .from('company_leads')
        .select('*', { count: 'exact', head: true });

      const { count: pendingLeads } = await supabase
        .from('company_leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'novo');

      // Fetch purchases count
      const { count: totalPurchases } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true });

      // Fetch recent leads
      const { data: recentLeads } = await supabase
        .from('company_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalCompanies: totalCompanies || 0,
        activeCompanies: activeCompanies || 0,
        totalUsers: totalUsers || 0,
        totalLeads: totalLeads || 0,
        pendingLeads: pendingLeads || 0,
        totalPurchases: totalPurchases || 0,
        recentActivity: recentLeads || [],
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const statCards = [
    {
      title: 'Empresas',
      value: stats.totalCompanies,
      subtitle: `${stats.activeCompanies} ativas`,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Usuários',
      value: stats.totalUsers,
      subtitle: 'Total cadastrados',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Leads',
      value: stats.totalLeads,
      subtitle: `${stats.pendingLeads} pendentes`,
      icon: UserPlus,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Vendas',
      value: stats.totalPurchases,
      subtitle: 'Total de vendas',
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader user={user} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Painel Administrativo
                </h1>
                <p className="text-muted-foreground mt-1">
                  Visão geral do sistema
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                  <Card key={stat.title} className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-3xl font-bold text-foreground mt-1">
                            {stat.value}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stat.subtitle}
                          </p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Leads Recentes
                    </CardTitle>
                    <CardDescription>
                      Últimas solicitações de acesso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentActivity.map((lead: any) => (
                          <div 
                            key={lead.id} 
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-foreground">
                                {lead.company_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {lead.contact_name} • {lead.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lead.status === 'novo' 
                                  ? 'bg-yellow-500/10 text-yellow-500'
                                  : lead.status === 'aprovado'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-slate-500/10 text-slate-500'
                              }`}>
                                {lead.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum lead recente</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Ações Rápidas
                    </CardTitle>
                    <CardDescription>
                      Acesse as funcionalidades principais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => navigate('/admin/empresas')}
                        className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <Building2 className="w-8 h-8 text-blue-500 mb-2" />
                        <p className="font-medium text-foreground">Empresas</p>
                        <p className="text-xs text-muted-foreground">Gerenciar empresas</p>
                      </button>
                      <button 
                        onClick={() => navigate('/admin/usuarios')}
                        className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <Users className="w-8 h-8 text-green-500 mb-2" />
                        <p className="font-medium text-foreground">Usuários</p>
                        <p className="text-xs text-muted-foreground">Gerenciar usuários</p>
                      </button>
                      <button 
                        onClick={() => navigate('/admin/leads')}
                        className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <UserPlus className="w-8 h-8 text-orange-500 mb-2" />
                        <p className="font-medium text-foreground">Leads</p>
                        <p className="text-xs text-muted-foreground">Solicitações de acesso</p>
                      </button>
                      <button 
                        onClick={() => navigate('/admin/prompts')}
                        className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <FileText className="w-8 h-8 text-purple-500 mb-2" />
                        <p className="font-medium text-foreground">Prompts</p>
                        <p className="text-xs text-muted-foreground">Biblioteca de prompts</p>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
