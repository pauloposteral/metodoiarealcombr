import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  BookOpen, 
  Trophy, 
  Clock, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

const MembersDashboard = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Aluno');
        }

        // Fetch modules
        const { data: modulesData } = await supabase
          .from('modules')
          .select('*')
          .order('order_index');
        
        if (modulesData) {
          setModules(modulesData);
        }

        // Fetch total lessons count
        const { count: lessonsCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true });
        
        setTotalLessons(lessonsCount || 0);

        // Fetch user's completed lessons
        if (user) {
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id)
            .eq('completed', true);
          
          setCompletedLessons(progressData?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <MembersLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-accent mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Área de Membros</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Bem-vindo ao Método IA Real, {userName}!
            </h1>
            <p className="text-primary-foreground/70 max-w-xl">
              Você está em um ambiente criado para ensinar inteligência artificial de forma prática, 
              clara e aplicável ao mundo real.
            </p>
          </div>
        </div>

        {/* Progress & Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Progress Card */}
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-foreground">Seu Progresso</h2>
              <Trophy className="w-5 h-5 text-gold" />
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {completedLessons} de {totalLessons} aulas concluídas
                </span>
                <span className="text-sm font-bold text-accent">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{modules.length}</p>
                <p className="text-xs text-muted-foreground">Módulos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{totalLessons}</p>
                <p className="text-xs text-muted-foreground">Aulas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{completedLessons}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h2 className="font-display font-bold text-lg text-foreground mb-4">Ações Rápidas</h2>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/membros/modulos')}
                className="w-full justify-between h-auto py-4 bg-accent/10 hover:bg-accent/20 text-accent"
                variant="ghost"
              >
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5" />
                  <span className="font-medium">Continuar de onde parei</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </Button>

              <Button 
                onClick={() => navigate('/membros/modulos')}
                className="w-full justify-between h-auto py-4"
                variant="ghost"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Ver todos os módulos</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </Button>

              <Button 
                onClick={() => navigate('/membros/materiais')}
                className="w-full justify-between h-auto py-4"
                variant="ghost"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Biblioteca de Prompts</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Modules Overview */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-foreground">Módulos do Curso</h2>
            <Button 
              variant="link" 
              onClick={() => navigate('/membros/modulos')}
              className="text-accent"
            >
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.slice(0, 4).map((module, index) => (
              <button
                key={module.id}
                onClick={() => navigate(`/membros/modulos/${module.id}`)}
                className="bg-card rounded-xl p-5 border border-border/50 text-left hover:border-accent/30 hover:shadow-elegant transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                  <span className="text-accent font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-display font-bold text-foreground mb-1 line-clamp-2">
                  {module.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {module.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-secondary/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <h2 className="font-display font-bold text-lg text-foreground">Novidades</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Fique atento! Novas aulas e materiais são adicionados regularmente. 
            Todas as atualizações estão incluídas no seu acesso.
          </p>
        </div>
      </div>
    </MembersLayout>
  );
};

export default MembersDashboard;
