import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { LessonComments } from '@/components/community/LessonComments';
import { MarkdownRenderer } from '@/components/course/MarkdownRenderer';
import { QuizPlayer } from '@/components/course/QuizPlayer';
import { AISandbox } from '@/components/course/AISandbox';
import { LessonNotes } from '@/components/course/LessonNotes';
import { useLessonTimeTracker } from '@/hooks/useLessonTimeTracker';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  Award,
  Play,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string | null;
  duration_minutes: number;
  estimated_minutes: number | null;
  order_index: number;
  content: string | null;
  prompts: string[] | null;
  type: string | null;
}

interface Module {
  id: string;
  title: string;
  course_id: string | null;
}

const LessonPlayer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Track time spent on lesson
  useLessonTimeTracker({ lessonId: lessonId || '', userId: currentUserId });
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .maybeSingle();

        if (lessonData) {
          setLesson(lessonData as Lesson);

          const { data: moduleData } = await supabase
            .from('modules')
            .select('id, title, course_id')
            .eq('id', lessonData.module_id)
            .maybeSingle();

          if (moduleData) setModule(moduleData);

          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', lessonData.module_id)
            .order('order_index');

          if (lessonsData) setAllLessons(lessonsData as Lesson[]);
        }

        if (user && lessonData) {
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('completed')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .maybeSingle();

          if (progressData?.completed) setIsCompleted(true);
          else setIsCompleted(false);

          // Check bookmark
          const { data: bookmarkData } = await supabase
            .from('lesson_bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .maybeSingle();
          setIsBookmarked(!!bookmarkData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          completed_at: new Date().toISOString(),
          status: 'completed',
        }, { onConflict: 'user_id,lesson_id' });

      if (error) throw error;

      setIsCompleted(true);
      toast({ title: "Aula concluída!", description: "Seu progresso foi salvo." });

      // Auto-advance to next lesson
      if (nextLesson) {
        setTimeout(() => navigate(`/membros/aula/${nextLesson.id}`), 800);
      }
    } catch (error) {
      console.error('Error marking complete:', error);
      toast({ title: "Erro", description: "Não foi possível salvar seu progresso.", variant: "destructive" });
    }
  };
  const toggleBookmark = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !lessonId) return;

    if (isBookmarked) {
      await supabase.from('lesson_bookmarks').delete().eq('user_id', user.id).eq('lesson_id', lessonId);
      setIsBookmarked(false);
      toast({ title: 'Removido dos salvos' });
    } else {
      await supabase.from('lesson_bookmarks').insert({ user_id: user.id, lesson_id: lessonId });
      setIsBookmarked(true);
      toast({ title: 'Aula salva!', description: 'Acesse suas aulas salvas no menu lateral.' });
    }
  };


  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isVideoLesson = lesson?.type === 'video' || (lesson?.video_url && lesson.type !== 'text');
  const minutes = lesson?.estimated_minutes || lesson?.duration_minutes || 0;

  if (loading) {
    return (
      <MembersLayout>
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-6 bg-secondary rounded w-40" />
          <div className="h-64 bg-secondary rounded-2xl" />
          <div className="h-32 bg-secondary rounded-2xl" />
        </div>
      </MembersLayout>
    );
  }

  if (!lesson || !module) {
    return (
      <MembersLayout>
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aula não encontrada</p>
          <Button variant="outline" onClick={() => navigate('/membros/cursos')} className="mt-4">
            Voltar aos cursos
          </Button>
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
          onClick={() => navigate(`/membros/modulos/${module.id}`)}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {module.title}
        </Button>

        {/* Lesson header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-accent text-sm mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Aula {lesson.order_index + 1}</span>
            {minutes > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {minutes} min
                </span>
              </>
            )}
            {isCompleted && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-accent flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Concluída
                </span>
              </>
            )}
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {lesson.title}
            </h1>
            <button
              onClick={toggleBookmark}
              className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0 mt-1"
              title={isBookmarked ? 'Remover dos salvos' : 'Salvar aula'}
            >
              {isBookmarked 
                ? <BookmarkCheck className="w-5 h-5 text-accent" />
                : <Bookmark className="w-5 h-5 text-muted-foreground" />
              }
            </button>
          </div>
          {lesson.description && (
            <p className="text-muted-foreground mt-2">{lesson.description}</p>
          )}
        </div>

        {/* Video (if video lesson) */}
        {isVideoLesson && lesson.video_url && (
          <div className="bg-secondary rounded-2xl aspect-video mb-8 overflow-hidden border border-border/50">
            <iframe
              src={lesson.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Content */}
        {lesson.content && (
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 mb-8">
            <MarkdownRenderer content={lesson.content} />
          </div>
        )}

        {/* Prompts */}
        {lesson.prompts && lesson.prompts.length > 0 && (
          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="font-display font-bold text-lg text-foreground">
                Prompts desta Aula
              </h2>
            </div>
            <div className="space-y-3">
              {lesson.prompts.map((prompt, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl p-4 border border-border/50 group cursor-pointer hover:border-accent/30 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(prompt);
                    toast({ title: "Copiado!", description: "Prompt copiado para a área de transferência." });
                  }}
                >
                  <p className="text-sm text-foreground font-mono leading-relaxed">{prompt}</p>
                  <p className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Clique para copiar
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {lessonId && <LessonNotes lessonId={lessonId} />}

        {/* Quiz */}
        {lessonId && <QuizPlayer lessonId={lessonId} />}

        {/* AI Sandbox */}
        {lessonId && lesson && (
          <AISandbox
            lessonId={lessonId}
            lessonTitle={lesson.title}
            prompts={lesson.prompts || undefined}
          />
        )}

        {/* Complete button */}
        {!isCompleted && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleMarkComplete}
              size="lg"
              className="bg-accent hover:bg-accent/90 px-8"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Concluir aula e avançar
            </Button>
          </div>
        )}

        {/* Comments */}
        {lessonId && <LessonComments lessonId={lessonId} />}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 pt-6 mt-8 border-t border-border/50">
          {prevLesson ? (
            <Button
              variant="outline"
              onClick={() => navigate(`/membros/aula/${prevLesson.id}`)}
              className="flex-1 max-w-[45%] justify-start"
            >
              <ChevronLeft className="w-4 h-4 mr-2 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs text-muted-foreground">Anterior</div>
                <div className="truncate text-sm">{prevLesson.title}</div>
              </div>
            </Button>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Button
              onClick={() => navigate(`/membros/aula/${nextLesson.id}`)}
              className="bg-accent hover:bg-accent/90 flex-1 max-w-[45%] justify-end"
            >
              <div className="text-right min-w-0">
                <div className="text-xs opacity-80">Próxima</div>
                <div className="truncate text-sm">{nextLesson.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 ml-2 flex-shrink-0" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/membros/certificado')}
              className="bg-accent hover:bg-accent/90"
            >
              <Award className="w-4 h-4 mr-2" />
              Ver certificado
            </Button>
          )}
        </div>
      </div>
    </MembersLayout>
  );
};

export default LessonPlayer;
