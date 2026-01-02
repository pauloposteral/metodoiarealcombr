import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2, 
  Clock,
  BookOpen,
  FileText,
  Sparkles
} from 'lucide-react';

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  content: string | null;
  prompts: string[] | null;
}

interface Module {
  id: string;
  title: string;
}

const LessonPlayer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch lesson
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .maybeSingle();

        if (lessonData) {
          setLesson(lessonData);

          // Fetch module
          const { data: moduleData } = await supabase
            .from('modules')
            .select('id, title')
            .eq('id', lessonData.module_id)
            .maybeSingle();

          if (moduleData) {
            setModule(moduleData);
          }

          // Fetch all lessons in this module for navigation
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', lessonData.module_id)
            .order('order_index');

          if (lessonsData) {
            setAllLessons(lessonsData);
          }
        }

        // Check if completed
        if (user && lessonData) {
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('completed')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .maybeSingle();

          if (progressData?.completed) {
            setIsCompleted(true);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  const handleMarkComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      setIsCompleted(true);
      toast({
        title: "Aula concluída!",
        description: "Seu progresso foi salvo.",
      });
    } catch (error) {
      console.error('Error marking complete:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu progresso.",
        variant: "destructive",
      });
    }
  };

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (!lesson || !module) {
    return (
      <MembersLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aula não encontrada</p>
        </div>
      </MembersLayout>
    );
  }

  return (
    <MembersLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(`/membros/modulos/${module.id}`)}
          className="mb-6 -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para {module.title}
        </Button>

        {/* Video Player */}
        <div className="bg-navy-dark rounded-2xl aspect-video mb-6 flex items-center justify-center relative overflow-hidden">
          {lesson.video_url ? (
            <iframe
              src={lesson.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-primary-foreground/60">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Vídeo em breve</p>
            </div>
          )}
        </div>

        {/* Lesson Info */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-accent text-sm mb-2">
                <BookOpen className="w-4 h-4" />
                <span>{module.title}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">Aula {lesson.order_index}</span>
              </div>
              <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
                {lesson.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {lesson.duration_minutes} min
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-sm text-green-500 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Concluída
                </span>
              )}
            </div>
          </div>

          {lesson.description && (
            <p className="text-muted-foreground mb-6">
              {lesson.description}
            </p>
          )}

          {/* Mark Complete Button */}
          {!isCompleted && (
            <Button
              onClick={handleMarkComplete}
              className="bg-accent hover:bg-accent/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marcar como concluída
            </Button>
          )}
        </div>

        {/* Additional Content */}
        {lesson.content && (
          <div className="bg-card rounded-2xl p-6 border border-border/50 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-accent" />
              <h2 className="font-display font-bold text-lg text-foreground">Material de Apoio</h2>
            </div>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {lesson.content}
            </div>
          </div>
        )}

        {/* Prompts */}
        {lesson.prompts && lesson.prompts.length > 0 && (
          <div className="bg-secondary/50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-gold" />
              <h2 className="font-display font-bold text-lg text-foreground">Prompts desta Aula</h2>
            </div>
            <div className="space-y-3">
              {lesson.prompts.map((prompt, index) => (
                <div key={index} className="bg-card rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-foreground font-mono">{prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-border/50">
          {prevLesson ? (
            <Button
              variant="outline"
              onClick={() => navigate(`/membros/aula/${prevLesson.id}`)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Aula anterior</span>
            </Button>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Button
              onClick={() => navigate(`/membros/aula/${nextLesson.id}`)}
              className="bg-accent hover:bg-accent/90"
            >
              <span className="hidden sm:inline">Próxima aula</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/membros/modulos')}
              className="bg-green-500 hover:bg-green-600"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Módulo concluído!
            </Button>
          )}
        </div>
      </div>
    </MembersLayout>
  );
};

export default LessonPlayer;
