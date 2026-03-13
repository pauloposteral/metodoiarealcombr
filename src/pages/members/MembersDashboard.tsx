import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { useGamification } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Play, BookOpen, Trophy, Clock, ArrowRight,
  Sparkles, CheckCircle2, Zap, Star, GraduationCap,
  Target, Flame
} from 'lucide-react';

interface CourseProgress {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  totalLessons: number;
  completedLessons: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

const MembersDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | undefined>();
  const [streak, setStreak] = useState(0);

  const { userPoints, earnedBadges, userRank, getLevelTitle } = useGamification(userId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Aluno');
        }

        // Fetch modules
        const { data: modulesData } = await supabase
          .from('modules')
          .select('*')
          .order('order_index');
        if (modulesData) setModules(modulesData);

        // Fetch total lessons
        const { count: lessonsCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true });
        setTotalLessons(lessonsCount || 0);

        // Fetch completed lessons
        let completedSet = new Set<string>();
        if (user) {
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id)
            .eq('completed', true);
          completedSet = new Set((progressData || []).map(p => p.lesson_id));
          setCompletedLessons(completedSet.size);

          // Calculate streak (consecutive days with completions)
          const { data: recentProgress } = await supabase
            .from('lesson_progress')
            .select('completed_at')
            .eq('user_id', user.id)
            .eq('completed', true)
            .order('completed_at', { ascending: false })
            .limit(30);

          if (recentProgress && recentProgress.length > 0) {
            const days = new Set(recentProgress.map(p => 
              new Date(p.completed_at!).toISOString().split('T')[0]
            ));
            const today = new Date();
            let s = 0;
            for (let i = 0; i < 30; i++) {
              const d = new Date(today);
              d.setDate(d.getDate() - i);
              if (days.has(d.toISOString().split('T')[0])) s++;
              else if (i > 0) break;
            }
            setStreak(s);
          }
        }

        // Fetch courses with progress
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, slug, thumbnail_url')
          .eq('is_published', true)
          .order('created_at');

        if (coursesData && coursesData.length > 0) {
          const courseProgressArr: CourseProgress[] = [];

          for (const course of coursesData) {
            const { data: courseModules } = await supabase
              .from('modules')
              .select('id')
              .eq('course_id', course.id);

            const moduleIds = (courseModules || []).map(m => m.id);
            if (moduleIds.length === 0) {
              courseProgressArr.push({ ...course, totalLessons: 0, completedLessons: 0, nextLessonId: null, nextLessonTitle: null });
              continue;
            }

            const { data: courseLessons } = await supabase
              .from('lessons')
              .select('id, title, order_index, module_id')
              .in('module_id', moduleIds)
              .order('order_index');

            const total = courseLessons?.length || 0;
            const done = (courseLessons || []).filter(l => completedSet.has(l.id)).length;
            const next = (courseLessons || []).find(l => !completedSet.has(l.id));

            courseProgressArr.push({
              ...course,
              totalLessons: total,
              completedLessons: done,
              nextLessonId: next?.id || null,
              nextLessonTitle: next?.title || null,
            });
          }
          setCourses(courseProgressArr);
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
  const activeCourse = courses.find(c => c.nextLessonId) || courses[0];

  return (
    <MembersLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-accent mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Área de Membros</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Bem-vindo, {userName}!
              </h1>
              <p className="text-primary-foreground/70 max-w-xl">
                Continue sua jornada de aprendizado em IA aplicada ao mundo real.
              </p>
            </div>

            {activeCourse?.nextLessonId && (
              <Button
                onClick={() => navigate(`/membros/aula/${activeCourse.nextLessonId}`)}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
              >
                <Play className="w-5 h-5 mr-2" />
                Continuar: {activeCourse.nextLessonTitle}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
            <Target className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{progressPercentage}%</p>
            <p className="text-xs text-muted-foreground">Progresso geral</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
            <CheckCircle2 className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{completedLessons}/{totalLessons}</p>
            <p className="text-xs text-muted-foreground">Aulas concluídas</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
            <Zap className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent">{userPoints?.points || 0}</p>
            <p className="text-xs text-muted-foreground">Nível {userPoints?.level || 1} — {getLevelTitle(userPoints?.level || 1)}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground">{streak === 1 ? 'dia seguido' : 'dias seguidos'}</p>
          </div>
        </div>

        {/* Courses Progress */}
        {courses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-foreground">Meus Cursos</h2>
              <Button variant="link" onClick={() => navigate('/membros/cursos')} className="text-accent">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => {
                const pct = course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;
                const isComplete = pct === 100;

                return (
                  <button
                    key={course.id}
                    onClick={() => course.nextLessonId 
                      ? navigate(`/membros/aula/${course.nextLessonId}`)
                      : navigate(`/membros/cursos/${course.slug}`)
                    }
                    className="bg-card rounded-2xl p-5 border border-border/50 text-left hover:border-accent/30 hover:shadow-elegant transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        {isComplete ? <Trophy className="w-5 h-5 text-accent" /> : <GraduationCap className="w-5 h-5 text-accent" />}
                      </div>
                      <span className="text-xs font-bold text-accent">{pct}%</span>
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-2 line-clamp-2">{course.title}</h3>
                    <Progress value={pct} className="h-1.5 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {course.completedLessons}/{course.totalLessons} aulas
                      {course.nextLessonTitle && !isComplete && (
                        <span className="block mt-1 text-accent">
                          Próxima: {course.nextLessonTitle}
                        </span>
                      )}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            onClick={() => navigate('/membros/ranking')}
            className="h-auto py-5 justify-start gap-3 bg-accent/5 hover:bg-accent/10 border border-accent/20"
            variant="ghost"
          >
            <Star className="w-5 h-5 text-accent" />
            <div className="text-left">
              <span className="font-medium text-foreground block">Ranking</span>
              <span className="text-xs text-muted-foreground">#{userRank || '—'} no ranking geral</span>
            </div>
          </Button>

          <Button 
            onClick={() => navigate('/membros/comunidade')}
            className="h-auto py-5 justify-start gap-3"
            variant="ghost"
          >
            <Sparkles className="w-5 h-5 text-accent" />
            <div className="text-left">
              <span className="font-medium text-foreground block">Comunidade</span>
              <span className="text-xs text-muted-foreground">Tire dúvidas e compartilhe</span>
            </div>
          </Button>

          <Button 
            onClick={() => navigate('/membros/materiais')}
            className="h-auto py-5 justify-start gap-3"
            variant="ghost"
          >
            <BookOpen className="w-5 h-5 text-accent" />
            <div className="text-left">
              <span className="font-medium text-foreground block">Materiais</span>
              <span className="text-xs text-muted-foreground">Prompts e downloads</span>
            </div>
          </Button>
        </div>

        {/* Modules Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-foreground">Módulos</h2>
            <Button variant="link" onClick={() => navigate('/membros/modulos')} className="text-accent">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.slice(0, 8).map((module, index) => (
              <button
                key={module.id}
                onClick={() => navigate(`/membros/modulos/${module.id}`)}
                className="bg-card rounded-xl p-5 border border-border/50 text-left hover:border-accent/30 hover:shadow-elegant transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                  <span className="text-accent font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-display font-bold text-foreground mb-1 line-clamp-2">{module.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{module.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </MembersLayout>
  );
};

export default MembersDashboard;
