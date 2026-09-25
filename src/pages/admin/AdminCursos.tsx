import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileJson, GraduationCap, Loader2, Plus, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { QuizManager } from '@/components/admin/QuizManager';
import { CourseItemDialog } from '@/components/admin/CourseItemDialog';
import { CurriculumImportDialog } from '@/components/admin/CurriculumImportDialog';
import { CourseRow, LessonRow, ModuleRow } from '@/components/admin/CourseTree';
import type { AdminCourse, AdminLesson, AdminModule, CourseItemTarget } from '@/components/admin/courseAdminTypes';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { describeDeleteError, nextOrderIndex } from '@/lib/adminCourseForm';
import { moduleCode, moduleDisplayTitle } from '@/lib/curriculum';

// `*` keeps the tree usable while the curriculum migration is rolling out (new columns optional).
async function fetchCourses(): Promise<AdminCourse[]> {
  const { data, error } = await supabase.from('courses').select('*').order('created_at');
  if (error) throw error;
  return data ?? [];
}

async function fetchModules(courseId: string): Promise<AdminModule[]> {
  const { data, error } = await supabase.from('modules').select('*').eq('course_id', courseId).order('order_index');
  if (error) throw error;
  return data ?? [];
}

async function fetchLessons(moduleId: string): Promise<AdminLesson[]> {
  const { data, error } = await supabase.from('lessons').select('*').eq('module_id', moduleId).order('order_index');
  if (error) throw error;
  return data ?? [];
}

type DeletableTable = 'courses' | 'modules' | 'lessons';

async function deleteRow(table: DeletableTable, id: string): Promise<void> {
  const { error } = table === 'courses'
    ? await supabase.from('courses').delete().eq('id', id)
    : table === 'modules'
      ? await supabase.from('modules').delete().eq('id', id)
      : await supabase.from('lessons').delete().eq('id', id);
  if (error) throw error;
}

function toggled(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

function withItem(set: Set<string>, id: string): Set<string> {
  return new Set(set).add(id);
}

function withoutItem(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  next.delete(id);
  return next;
}

function AdminShell({ user, children }: { user: User | null; children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {user && <AdminHeader user={user} />}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminCursos() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [modules, setModules] = useState<Record<string, AdminModule[]>>({});
  const [lessons, setLessons] = useState<Record<string, AdminLesson[]>>({});
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(() => new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set());
  const [editTarget, setEditTarget] = useState<CourseItemTarget | null>(null);
  const [quizLesson, setQuizLesson] = useState<{ id: string; title: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      setCourses(await fetchCourses());
      setLoadFailed(false);
    } catch (error) {
      console.error('[AdminCursos] failed to load courses', error);
      setLoadFailed(true);
      toast.error('Não foi possível carregar os cursos.');
    }
  }, []);

  const loadModules = useCallback(async (courseId: string): Promise<AdminModule[] | null> => {
    try {
      const list = await fetchModules(courseId);
      setModules((previous) => ({ ...previous, [courseId]: list }));
      return list;
    } catch (error) {
      console.error('[AdminCursos] failed to load modules', { courseId, error });
      setExpandedCourses((previous) => withoutItem(previous, courseId));
      toast.error('Não foi possível carregar os módulos. Tente abrir o curso de novo.');
      return null;
    }
  }, []);

  const loadLessons = useCallback(async (moduleId: string): Promise<AdminLesson[] | null> => {
    try {
      const list = await fetchLessons(moduleId);
      setLessons((previous) => ({ ...previous, [moduleId]: list }));
      return list;
    } catch (error) {
      console.error('[AdminCursos] failed to load lessons', { moduleId, error });
      setExpandedModules((previous) => withoutItem(previous, moduleId));
      toast.error('Não foi possível carregar as aulas. Tente abrir o módulo de novo.');
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const { data: { user: current } } = await supabase.auth.getUser();
        if (!active) return;
        if (!current) { navigate('/admin/login', { replace: true }); return; }
        const { data: role, error } = await supabase.from('user_roles').select('role').eq('user_id', current.id).eq('role', 'admin').maybeSingle();
        if (!active) return;
        if (error || !role) { navigate('/admin/login', { replace: true }); return; }
        setUser(current);
        await loadCourses();
      } catch (error) {
        console.error('[AdminCursos] failed to verify admin access', error);
        if (active) setLoadFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void init();
    return () => { active = false; };
  }, [navigate, loadCourses]);

  const toggleCourse = (courseId: string) => {
    if (!expandedCourses.has(courseId) && !modules[courseId]) void loadModules(courseId);
    setExpandedCourses((previous) => toggled(previous, courseId));
  };

  const toggleModule = (moduleId: string) => {
    if (!expandedModules.has(moduleId) && !lessons[moduleId]) void loadLessons(moduleId);
    setExpandedModules((previous) => toggled(previous, moduleId));
  };

  const openNewModule = async (courseId: string) => {
    const list = modules[courseId] ?? await loadModules(courseId);
    if (!list) return;
    setExpandedCourses((previous) => withItem(previous, courseId));
    setEditTarget({ mode: 'module', item: null, courseId, orderIndex: nextOrderIndex(list) });
  };

  const openNewLesson = async (moduleId: string) => {
    const list = lessons[moduleId] ?? await loadLessons(moduleId);
    if (!list) return;
    setExpandedModules((previous) => withItem(previous, moduleId));
    setEditTarget({ mode: 'lesson', item: null, moduleId, orderIndex: nextOrderIndex(list) });
  };

  const handleSaved = (target: CourseItemTarget) => {
    setEditTarget(null);
    if (target.mode === 'course') void loadCourses();
    else if (target.mode === 'module') void loadModules(target.courseId);
    else void loadLessons(target.moduleId);
  };

  const handleDelete = async (label: string, table: DeletableTable, id: string, refresh: () => Promise<unknown>) => {
    if (!window.confirm(`Excluir ${label}? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteRow(table, id);
      toast.success('Excluído com sucesso');
      await refresh();
    } catch (error) {
      console.error('[AdminCursos] delete failed', { table, id, error });
      toast.error(describeDeleteError(error));
    }
  };

  const handleImported = async (courseId: string) => {
    setModules({});
    setLessons({});
    setExpandedModules(new Set());
    setExpandedCourses(new Set([courseId]));
    await Promise.all([loadCourses(), loadModules(courseId)]);
  };

  const renderLessons = (module: AdminModule) => {
    const list = lessons[module.id];
    if (!list) return <p role="status" className="py-3 pl-4 text-xs text-muted-foreground sm:pl-20">Carregando aulas…</p>;
    if (list.length === 0) {
      return (
        <p className="py-3 pl-4 text-xs text-muted-foreground sm:pl-20">
          Sem aulas.{' '}
          <button type="button" onClick={() => void openNewLesson(module.id)} className="font-medium text-foreground underline underline-offset-2">
            Adicionar aula
          </button>
        </p>
      );
    }
    return (
      <ul>
        {list.map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            onQuiz={() => setQuizLesson({ id: lesson.id, title: lesson.title })}
            onEdit={() => setEditTarget({ mode: 'lesson', item: lesson, moduleId: module.id, orderIndex: lesson.order_index })}
            onDelete={() => void handleDelete(`a aula "${lesson.title}"`, 'lessons', lesson.id, () => loadLessons(module.id))}
          />
        ))}
      </ul>
    );
  };

  const renderModules = (course: AdminCourse) => {
    const list = modules[course.id];
    if (!list) return <p role="status" className="p-4 text-sm text-muted-foreground">Carregando módulos…</p>;
    if (list.length === 0) {
      return (
        <p className="p-4 text-center text-sm text-muted-foreground">
          Nenhum módulo ainda.{' '}
          <button type="button" onClick={() => void openNewModule(course.id)} className="font-medium text-foreground underline underline-offset-2">
            Criar primeiro módulo
          </button>
        </p>
      );
    }
    return (
      <ul>
        {list.map((module) => {
          const code = moduleCode(module);
          const label = `o módulo "${code ? `${code} ` : ''}${moduleDisplayTitle(module)}" e as aulas dele`;
          return (
            <ModuleRow
              key={module.id}
              module={module}
              expanded={expandedModules.has(module.id)}
              onToggle={() => toggleModule(module.id)}
              onAddLesson={() => void openNewLesson(module.id)}
              onEdit={() => setEditTarget({ mode: 'module', item: module, courseId: course.id, orderIndex: module.order_index })}
              onDelete={() => void handleDelete(label, 'modules', module.id, () => loadModules(course.id))}
            >
              {renderLessons(module)}
            </ModuleRow>
          );
        })}
      </ul>
    );
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AdminShell user={null}>
          <div role="status" className="flex h-full items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Carregando cursos…</span>
          </div>
        </AdminShell>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AdminShell user={user}>
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <GraduationCap className="h-6 w-6 text-accent" aria-hidden="true" />
                Gerenciar cursos
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Crie e organize cursos, módulos e aulas, ou importe o pacote do currículo.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
                <FileJson aria-hidden="true" />
                Importar currículo
              </Button>
              <Button type="button" onClick={() => setEditTarget({ mode: 'course', item: null })} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus aria-hidden="true" />
                Novo curso
              </Button>
            </div>
          </header>

          {loadFailed && courses.length === 0 ? (
            <div role="alert" className="rounded-2xl border border-border/50 bg-card py-16 text-center">
              <p className="mb-4 text-foreground">Não foi possível carregar os cursos.</p>
              <Button type="button" variant="outline" onClick={() => void loadCourses()}>
                <RotateCcw aria-hidden="true" />
                Tentar de novo
              </Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card py-16 text-center">
              <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
              <h2 className="mb-2 text-lg font-semibold text-foreground">Nenhum curso criado</h2>
              <p className="mb-4 text-muted-foreground">Crie o primeiro curso ou importe o pacote do currículo.</p>
              <Button type="button" onClick={() => setEditTarget({ mode: 'course', item: null })}>
                <Plus aria-hidden="true" />
                Criar curso
              </Button>
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Cursos">
              {courses.map((course) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  expanded={expandedCourses.has(course.id)}
                  onToggle={() => toggleCourse(course.id)}
                  onAddModule={() => void openNewModule(course.id)}
                  onEdit={() => setEditTarget({ mode: 'course', item: course })}
                  onDelete={() => void handleDelete(`o curso "${course.title}" e todo o conteúdo dele`, 'courses', course.id, loadCourses)}
                >
                  {renderModules(course)}
                </CourseRow>
              ))}
            </ul>
          )}
        </div>
      </AdminShell>

      {editTarget && (
        <CourseItemDialog
          key={`${editTarget.mode}-${editTarget.item?.id ?? 'new'}`}
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}
      {importOpen && <CurriculumImportDialog onClose={() => setImportOpen(false)} onImported={(courseId) => void handleImported(courseId)} />}
      {quizLesson && (
        <QuizManager lessonId={quizLesson.id} lessonTitle={quizLesson.title} open onClose={() => setQuizLesson(null)} />
      )}
    </SidebarProvider>
  );
}
