import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Clock, Star, Lock, ArrowRight, 
  GraduationCap, Sparkles 
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
  is_published: boolean | null;
  tags: string[] | null;
}

interface CourseWithProgress extends Course {
  totalLessons: number;
  completedLessons: number;
}

const difficultyLabels: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-500',
  intermediate: 'bg-amber-500/10 text-amber-500',
  advanced: 'bg-red-500/10 text-red-500',
};

export default function MembersCourses() {
  const navigate = useNavigate();
  const { isPro, isPremium, isFree } = useSubscription();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .order('created_at');

        if (!coursesData) return;

        // Fetch modules + lessons for each course
        const enriched: CourseWithProgress[] = await Promise.all(
          coursesData.map(async (course) => {
            const { data: modules } = await supabase
              .from('modules')
              .select('id')
              .eq('course_id', course.id);

            const moduleIds = modules?.map(m => m.id) || [];
            let totalLessons = 0;
            let completedLessons = 0;

            if (moduleIds.length > 0) {
              const { count } = await supabase
                .from('lessons')
                .select('*', { count: 'exact', head: true })
                .in('module_id', moduleIds);
              totalLessons = count || 0;

              if (user) {
                const { data: lessonIds } = await supabase
                  .from('lessons')
                  .select('id')
                  .in('module_id', moduleIds);

                if (lessonIds && lessonIds.length > 0) {
                  const { count: doneCount } = await supabase
                    .from('lesson_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('completed', true)
                    .in('lesson_id', lessonIds.map(l => l.id));
                  completedLessons = doneCount || 0;
                }
              }
            }

            return { ...course, totalLessons, completedLessons };
          })
        );

        setCourses(enriched);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const canAccess = (course: Course) => {
    if (course.is_free) return true;
    return isPro || isPremium;
  };

  return (
    <MembersLayout>
      <Helmet>
        <title>Cursos — IA Real Academy</title>
        <meta name="description" content="Explore todos os cursos disponíveis na IA Real Academy." />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-accent" />
              Cursos
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore todos os cursos disponíveis e comece a aprender
            </p>
          </div>
          {isFree && (
            <Button onClick={() => navigate('/pricing')} className="bg-accent hover:bg-accent/90">
              <Sparkles className="w-4 h-4 mr-2" />
              Desbloquear todos
            </Button>
          )}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 h-72 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Nenhum curso disponível</h2>
            <p className="text-muted-foreground">Novos cursos serão adicionados em breve!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const accessible = canAccess(course);
              const progress = course.totalLessons > 0
                ? Math.round((course.completedLessons / course.totalLessons) * 100)
                : 0;

              return (
                <button
                  key={course.id}
                  onClick={() => navigate(`/membros/cursos/${course.slug}`)}
                  className="bg-card rounded-2xl border border-border/50 overflow-hidden text-left hover:border-accent/30 hover:shadow-elegant transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-secondary relative overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {!accessible && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    {course.is_free && (
                      <Badge className="absolute top-3 left-3 bg-green-500 text-white">Grátis</Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {course.difficulty && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[course.difficulty] || ''}`}>
                          {difficultyLabels[course.difficulty] || course.difficulty}
                        </span>
                      )}
                      {course.estimated_hours && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.estimated_hours}h
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                      {course.title}
                    </h3>
                    
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    )}

                    {/* Progress */}
                    {accessible && course.totalLessons > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {course.completedLessons}/{course.totalLessons} aulas
                          </span>
                          <span className="font-medium text-accent">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}

                    {!accessible && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                        <Lock className="w-3 h-3" />
                        Requer plano Pro ou Premium
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </MembersLayout>
  );
}
