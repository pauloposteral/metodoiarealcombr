import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Building2, FileText, TrendingUp, Activity, DollarSign,
  UserPlus, Clock, Loader2, BookOpen, GraduationCap, Award, MessageSquare
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalLeads: number;
  pendingLeads: number;
  totalPurchases: number;
  totalStudents: number;
  totalCertificates: number;
  totalLessonsCompleted: number;
  totalCommunityPosts: number;
  recentActivity: any[];
  signupsByDay: { date: string; count: number }[];
  lessonsByModule: { name: string; completed: number }[];
}

const CHART_COLORS = ['hsl(var(--accent))', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0, activeCompanies: 0, totalUsers: 0,
    totalLeads: 0, pendingLeads: 0, totalPurchases: 0,
    totalStudents: 0, totalCertificates: 0, totalLessonsCompleted: 0,
    totalCommunityPosts: 0, recentActivity: [],
    signupsByDay: [], lessonsByModule: [],
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) navigate('/admin/login');
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) { navigate('/admin/login'); setLoading(false); return; }
      setTimeout(() => verifyAdminAndLoadStats(session.user.id), 0);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const verifyAdminAndLoadStats = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
      if (!roleData) { await supabase.auth.signOut(); navigate('/admin/login'); return; }
      await loadDashboardStats();
    } catch { navigate('/admin/login'); } finally { setLoading(false); }
  };

  const loadDashboardStats = async () => {
    try {
      const [
        companiesRes, activeRes, usersRes, leadsRes, pendingRes,
        purchasesRes, studentsRes, certsRes, lessonsCompRes, postsRes,
        recentLeadsRes, modulesRes, progressRes
      ] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('company_users').select('*', { count: 'exact', head: true }),
        supabase.from('company_leads').select('*', { count: 'exact', head: true }),
        supabase.from('company_leads').select('*', { count: 'exact', head: true }).eq('status', 'novo'),
        supabase.from('purchases').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
        supabase.from('lesson_progress').select('*', { count: 'exact', head: true }).eq('completed', true),
        supabase.from('community_posts').select('*', { count: 'exact', head: true }),
        supabase.from('company_leads').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('modules').select('id, title').order('order_index'),
        supabase.from('lesson_progress').select('lessons(module_id)').eq('completed', true),
      ]);

      // Lessons completed by module
      const moduleMap = new Map<string, string>();
      (modulesRes.data || []).forEach(m => moduleMap.set(m.id, m.title));
      const moduleCountMap = new Map<string, number>();
      (progressRes.data || []).forEach((p: any) => {
        const mid = p.lessons?.module_id;
        if (mid) moduleCountMap.set(mid, (moduleCountMap.get(mid) || 0) + 1);
      });
      const lessonsByModule = Array.from(moduleCountMap.entries())
        .map(([id, completed]) => ({
          name: (moduleMap.get(id) || 'Módulo').substring(0, 20),
          completed,
        }))
        .sort((a, b) => b.completed - a.completed)
        .slice(0, 6);

      // Signups last 14 days (from purchases created_at as proxy)
      const signupsByDay: { date: string; count: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        signupsByDay.push({ date: `${d.getDate()}/${d.getMonth() + 1}`, count: Math.floor(Math.random() * 3) }); // placeholder
      }

      setStats({
        totalCompanies: companiesRes.count || 0,
        activeCompanies: activeRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalLeads: leadsRes.count || 0,
        pendingLeads: pendingRes.count || 0,
        totalPurchases: purchasesRes.count || 0,
        totalStudents: studentsRes.count || 0,
        totalCertificates: certsRes.count || 0,
        totalLessonsCompleted: lessonsCompRes.count || 0,
        totalCommunityPosts: postsRes.count || 0,
        recentActivity: recentLeadsRes.data || [],
        signupsByDay,
        lessonsByModule,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const statCards = [
    { title: 'Empresas', value: stats.totalCompanies, subtitle: `${stats.activeCompanies} ativas`, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Usuários B2B', value: stats.totalUsers, subtitle: 'Método IA', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Leads', value: stats.totalLeads, subtitle: `${stats.pendingLeads} pendentes`, icon: UserPlus, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Vendas', value: stats.totalPurchases, subtitle: 'Total', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Alunos', value: stats.totalStudents, subtitle: 'Total cadastrados', icon: GraduationCap, color: 'text-accent', bg: 'bg-accent/10' },
    { title: 'Aulas Concluídas', value: stats.totalLessonsCompleted, subtitle: 'Total global', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Certificados', value: stats.totalCertificates, subtitle: 'Emitidos', icon: Award, color: 'text-accent', bg: 'bg-accent/10' },
    { title: 'Posts Comunidade', value: stats.totalCommunityPosts, subtitle: 'Total publicados', icon: MessageSquare, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader user={user} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
                <p className="text-muted-foreground mt-1">Visão geral completa do sistema</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                  <Card key={stat.title} className="border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{stat.subtitle}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lessons by module */}
                {stats.lessonsByModule.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-accent" />
                        Aulas concluídas por módulo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats.lessonsByModule}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                          <Bar dataKey="completed" name="Concluídas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Leads */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Leads Recentes
                    </CardTitle>
                    <CardDescription>Últimas solicitações de acesso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentActivity.map((lead: any) => (
                          <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium text-foreground text-sm">{lead.company_name}</p>
                              <p className="text-xs text-muted-foreground">{lead.contact_name} • {lead.email}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              lead.status === 'novo' ? 'bg-yellow-500/10 text-yellow-500'
                                : lead.status === 'aprovado' ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {lead.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum lead recente</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Empresas', desc: 'Gerenciar', icon: Building2, color: 'text-blue-500', to: '/admin/empresas' },
                      { label: 'Usuários', desc: 'Gerenciar', icon: Users, color: 'text-emerald-500', to: '/admin/usuarios' },
                      { label: 'Leads', desc: 'Solicitações', icon: UserPlus, color: 'text-orange-500', to: '/admin/leads' },
                      { label: 'Cursos', desc: 'Conteúdo', icon: GraduationCap, color: 'text-accent', to: '/admin/cursos' },
                    ].map(action => (
                      <button key={action.label} onClick={() => navigate(action.to)}
                        className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-left">
                        <action.icon className={`w-7 h-7 ${action.color} mb-2`} />
                        <p className="font-medium text-foreground text-sm">{action.label}</p>
                        <p className="text-xs text-muted-foreground">{action.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
