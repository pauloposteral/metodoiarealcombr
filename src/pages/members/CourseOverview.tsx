import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, Clock, ChevronRight, Lock, Play,
  CheckCircle2, ArrowLeft, Sparkles, GraduationCap
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  estimated_hours: number | null;
  difficulty: string | null;
  is_free: boolean | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  estimated_minutes: number | null;
  is_free: boolean | null;
  completed: boolean;
}

export default function CourseOverview() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isPro, isPremium } = useSubscription();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch course
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();

        if (!courseData) {
          navigate('/membros/cursos');
          return;
        }
        setCourse(courseData);

        // Fetch modules with lessons
        const { data: modulesData } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', courseData.id)
          .eq('is_published', true)
          .order('order_index');

        if (!modulesData) return;

        // Fetch lessons per module
        const enrichedModules: Module[] = await Promise.all(
          modulesData.map(async (mod) => {
            const { data: lessons } = await supabase
              .from('lessons')
              .select('id, title, description, order_index, estimated_minutes, is_free')
              .eq('module_id', mod.id)
              .order('order_index');

            let completedIds: string[] = [];
            if (user && lessons) {
              const { data: progress } = await supabase
                .from('lesson_progress')
                .select('lesson_id')
                .eq('user_id', user.id)
                .eq('completed', true)
                .in('lesson_id', lessons.map(l => l.id));
              completedIds = progress?.map(p => p.lesson_id) || [];
            }

            return {
              ...mod,
              lessons: (lessons || []).map(l => ({
                ...l,
                completed: completedIds.includes(l.id),
              })),
            };
          })
        );

        setModules(enrichedModules);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [slug, navigate]);

  if (loading) {
    return (
      <MembersLayout>
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded w-1/3" />
          <div className="h-48 bg-secondary rounded-2xl" />
          <div className="h-32 bg-secondary rounded-2xl" />
        </div>
      </MembersLayout>
    );
  }

  if (!course) return null;

  const canAccess = course.is_free || isPro || isPremium;
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = modules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0);
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find first incomplete lesson for "continue" button
  const nextLesson = modules
    .flatMap(m => m.lessons)
    .find(l => !l.completed);

  return (
    <MembersLayout>
      <Helmet>
        <title>{course.title} — IA Real Academy</title>
        <meta name="description" content={course.description || ''} />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => navigate('/membros/cursos')}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Todos os cursos
        </Button>

        {/* Course Header */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {course.thumbnail_url && (
            <div className="aspect-[3/1] relative overflow-hidden">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
          )}
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {course.is_free && <Badge className="bg-accent text-accent-foreground">Grátis</Badge>}
              {course.difficulty && (
                <Badge variant="secondary">
                  {course.difficulty === 'beginner' ? 'Iniciante' : course.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                </Badge>
              )}
              {course.estimated_hours && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.estimated_hours}h estimadas
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {course.title}
            </h1>

            {course.description && (
              <p className="text-muted-foreground leading-relaxed">{course.description}</p>
            )}

            {/* Progress bar */}
            {canAccess && totalLessons > 0 && (
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{completedLessons} de {totalLessons} aulas concluídas</span>
                  <span className="font-bold text-accent">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* CTA */}
            {canAccess ? (
              nextLesson && (
                <Button
                  onClick={() => navigate(`/membros/aula/${nextLesson.id}`)}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {completedLessons > 0 ? 'Continuar de onde parei' : 'Começar curso'}
                </Button>
              )
            ) : (
              <Button onClick={() => navigate('/pricing')} className="bg-accent hover:bg-accent/90">
                <Sparkles className="w-4 h-4 mr-2" />
                Desbloquear curso
              </Button>
            )}
          </div>
        </div>

        {/* Modules & Lessons */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Conteúdo do curso
          </h2>

          {modules.map((mod, modIdx) => (
            <div key={mod.id} className="bg-card rounded-xl border border-border/50 overflow-hidden">
              {/* Module header */}
              <div className="p-4 md:p-5 bg-secondary/30 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold text-sm">{modIdx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-foreground">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{mod.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {mod.lessons.filter(l => l.completed).length}/{mod.lessons.length}
                  </span>
                </div>
              </div>

              {/* Lessons list */}
              <div className="divide-y divide-border/50">
                {mod.lessons.map(lesson => {
                  const lessonAccessible = canAccess || lesson.is_free;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => lessonAccessible && navigate(`/membros/aula/${lesson.id}`)}
                      disabled={!lessonAccessible}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      ) : lessonAccessible ? (
                        <Play className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                        {lesson.estimated_minutes && (
                          <p className="text-xs text-muted-foreground">{lesson.estimated_minutes} min</p>
                        )}
                      </div>
                      {lessonAccessible && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MembersLayout>
  );
}
