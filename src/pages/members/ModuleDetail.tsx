import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Play, 
  CheckCircle2, 
  Clock,
  BookOpen,
  Lock
} from 'lucide-react';
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
  description: string;
  duration_minutes: number;
  order_index: number;
}

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch module
        const { data: moduleData } = await supabase
          .from('modules')
          .select('*')
          .eq('id', moduleId)
          .maybeSingle();

        if (moduleData) {
          setModule(moduleData);
        }

        // Fetch lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', moduleId)
          .order('order_index');

        if (lessonsData) {
          setLessons(lessonsData);
        }

        // Fetch progress
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
  }, [moduleId]);

  const progress = lessons.length > 0 
    ? Math.round((lessons.filter(l => completedLessons.has(l.id)).length / lessons.length) * 100)
    : 0;

  const totalMinutes = lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);

  if (!module) {
    return (
      <MembersLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Módulo não encontrado</p>
        </div>
      </MembersLayout>
    );
  }

  return (
    <MembersLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/membros/modulos')}
          className="mb-6 -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar aos módulos
        </Button>

        {/* Module Header */}
        <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-8 text-primary-foreground mb-8">
          <div className="flex items-center gap-2 text-accent mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">Módulo {module.order_index}</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
            {module.title}
          </h1>
          <p className="text-primary-foreground/70 mb-6">
            {module.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {lessons.length} aulas
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {totalMinutes} minutos
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {progress}% concluído
            </span>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2 bg-primary-foreground/20" />
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-lg text-foreground mb-4">
            Aulas do Módulo
          </h2>

          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons.has(lesson.id);

            return (
              <button
                key={lesson.id}
                onClick={() => navigate(`/membros/aula/${lesson.id}`)}
                className="w-full bg-card rounded-xl p-5 border border-border/50 hover:border-accent/30 hover:shadow-elegant transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  {/* Lesson Number / Status */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  {/* Duration & Play */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {lesson.duration_minutes} min
                    </span>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500/10' 
                        : 'bg-accent/10 group-hover:bg-accent group-hover:text-accent-foreground'
                    } transition-colors`}>
                      <Play className={`w-4 h-4 ${isCompleted ? 'text-green-500' : 'text-accent group-hover:text-accent-foreground'}`} />
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

export default ModuleDetail;
