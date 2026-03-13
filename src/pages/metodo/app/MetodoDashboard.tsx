import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, PenTool, BookOpen, ArrowRight, Sparkles,
  TrendingUp, Clock, Target, Users, BarChart3, CheckCircle2, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollReveal } from '@/components/ScrollReveal';

interface ContextType {
  user: any;
  companyData: {
    role: string;
    company: {
      id: string;
      name: string;
      plan: string;
    };
  };
}

interface TeamMember {
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

interface CompanyStats {
  totalMembers: number;
  totalPromptsSaved: number;
  recentMembers: TeamMember[];
}

const quickActions = [
  {
    icon: FileText,
    title: 'Central de Prompts',
    description: 'Explore prompts organizados por categoria',
    href: '/metodo/app/prompts',
    color: 'text-blue-500 bg-blue-500/10'
  },
  {
    icon: PenTool,
    title: 'Editor de Conteúdo',
    description: 'Crie posts e carrosséis rapidamente',
    href: '/metodo/app/editor',
    color: 'text-purple-500 bg-purple-500/10'
  },
  {
    icon: BookOpen,
    title: 'Treinamento',
    description: 'Aprenda a usar a plataforma',
    href: '/metodo/app/treinamento',
    color: 'text-green-500 bg-green-500/10'
  }
];

const tips = [
  'Comece pela Central de Prompts. Escolha um prompt de marketing, personalize com os dados da sua empresa e copie o resultado.',
  'Use o Editor de Conteúdo para criar carrosséis para Instagram em segundos com IA.',
  'Convide membros da equipe para multiplicar a produtividade com IA na empresa.',
  'Explore a categoria "Vendas" nos prompts para criar scripts de abordagem personalizados.',
  'Salve seus prompts favoritos para acessá-los rapidamente no dia a dia.',
];

export default function MetodoDashboard() {
  const { user, companyData } = useOutletContext<ContextType>();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário';
  const [companyStats, setCompanyStats] = useState<CompanyStats>({
    totalMembers: 0, totalPromptsSaved: 0, recentMembers: [],
  });
  const [loading, setLoading] = useState(true);

  const todayTip = tips[new Date().getDate() % tips.length];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const companyId = companyData.company.id;

        // Fetch team members count + recent
        const { data: members, count: memberCount } = await supabase
          .from('company_users')
          .select('user_id, role, joined_at', { count: 'exact' })
          .eq('company_id', companyId)
          .order('joined_at', { ascending: false })
          .limit(5);

        // Fetch saved prompts count for company users
        const memberIds = (members || []).map(m => m.user_id);
        let promptsSaved = 0;
        if (memberIds.length > 0) {
          const { count } = await supabase
            .from('user_saved_prompts')
            .select('id', { count: 'exact', head: true })
            .in('user_id', memberIds);
          promptsSaved = count || 0;
        }

        setCompanyStats({
          totalMembers: memberCount || 0,
          totalPromptsSaved: promptsSaved,
          recentMembers: (members || []) as TeamMember[],
        });
      } catch (error) {
        console.error('Error fetching company stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [companyData.company.id]);

  const planLabel = companyData.company.plan === 'business' ? 'Business' : companyData.company.plan === 'pro' ? 'Pro' : 'Starter';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <ScrollReveal>
        <div className="bg-gradient-to-br from-navy-dark to-navy rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-accent mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">{companyData.company.name} · Plano {planLabel}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Olá, {firstName}! 👋
              </h1>
              <p className="text-white/70 max-w-lg">
                Use as ferramentas abaixo para produzir mais e economizar tempo todos os dias.
              </p>
            </div>
            <Link to="/metodo/app/prompts">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0">
                <FileText className="w-5 h-5 mr-2" />
                Ir para Prompts
              </Button>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 text-center">
          <CardContent className="pt-5 pb-4">
            <Users className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{companyStats.totalMembers}</p>
            <p className="text-xs text-muted-foreground">Membros da equipe</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 text-center">
          <CardContent className="pt-5 pb-4">
            <FileText className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{companyStats.totalPromptsSaved}</p>
            <p className="text-xs text-muted-foreground">Prompts salvos</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 text-center">
          <CardContent className="pt-5 pb-4">
            <Target className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">5</p>
            <p className="text-xs text-muted-foreground">Categorias</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 text-center">
          <CardContent className="pt-5 pb-4">
            <TrendingUp className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">10h+</p>
            <p className="text-xs text-muted-foreground">Economia/semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Acesso rápido</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <ScrollReveal key={action.href} delay={index * 100}>
              <Link to={action.href}>
                <Card className="h-full hover:border-accent/50 transition-colors cursor-pointer group">
                  <CardHeader className="pb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${action.color}`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base group-hover:text-accent transition-colors">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-sm">{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className="text-sm text-accent font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Acessar <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Team + Tip */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Team */}
        {companyData.role === 'admin' && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Equipe
              </CardTitle>
              <CardDescription>{companyStats.totalMembers} membro{companyStats.totalMembers !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              {companyStats.recentMembers.length > 0 ? (
                <div className="space-y-3">
                  {companyStats.recentMembers.map((member) => (
                    <div key={member.user_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {member.user_id.substring(0, 8)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum membro ainda</p>
              )}
              <Link to="/metodo/app/equipe">
                <Button variant="link" className="text-accent mt-2 p-0">
                  Gerenciar equipe <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Tip */}
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">Dica do dia</h3>
                <p className="text-sm text-muted-foreground">{todayTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
