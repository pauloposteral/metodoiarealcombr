import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  duration_minutes: number;
}

const MembersModules = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsPerModule, setLessonsPerModule] = useState<Record<string, Lesson[]>>({});
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch modules
        const { data: modulesData } = await supabase
          .from('modules')
          .select('*')
          .order('order_index');

        if (modulesData) {
          setModules(modulesData);
        }

        // Fetch all lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .order('order_index');

        if (lessonsData) {
          const grouped: Record<string, Lesson[]> = {};
          lessonsData.forEach(lesson => {
            if (!grouped[lesson.module_id]) {
              grouped[lesson.module_id] = [];
            }
            grouped[lesson.module_id].push(lesson);
          });
          setLessonsPerModule(grouped);
        }

        // Fetch completed lessons
        if (user) {
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('completed', true);

          if (progressData) {
            setCompletedLessons(new Set(progressData.map(p => p.lesson_id)));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getModuleProgress = (moduleId: string) => {
    const lessons = lessonsPerModule[moduleId] || [];
    if (lessons.length === 0) return 0;
    const completed = lessons.filter(l => completedLessons.has(l.id)).length;
    return Math.round((completed / lessons.length) * 100);
  };

  const getTotalDuration = (moduleId: string) => {
    const lessons = lessonsPerModule[moduleId] || [];
    return lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
  };

  return (
    <MembersLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Módulos do Curso
          </h1>
          <p className="text-muted-foreground">
            {modules.length} módulos disponíveis para você
          </p>
        </div>

        <div className="space-y-4">
          {modules.map((module, index) => {
            const progress = getModuleProgress(module.id);
            const lessonCount = lessonsPerModule[module.id]?.length || 0;
            const completedCount = lessonsPerModule[module.id]?.filter(l => completedLessons.has(l.id)).length || 0;
            const totalMinutes = getTotalDuration(module.id);

            return (
              <button
                key={module.id}
                onClick={() => navigate(`/membros/modulos/${module.id}`)}
                className="w-full bg-card rounded-2xl p-6 border border-border/50 hover:border-accent/30 hover:shadow-elegant transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  {/* Module Number */}
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    {progress === 100 ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <span className="text-accent font-bold text-lg">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display font-bold text-lg text-foreground mb-1 group-hover:text-accent transition-colors">
                          {module.title}
                        </h2>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {module.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {lessonCount} aulas
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {totalMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {completedCount}/{lessonCount} concluídas
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <Progress value={progress} className="h-2 flex-1" />
                      <span className="text-xs font-medium text-accent w-10 text-right">
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </MembersLayout>
  );
};

export default MembersModules;
