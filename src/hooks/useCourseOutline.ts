import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { databaseRpc } from '@/lib/databaseRpc';
import {
  EMPTY_OUTLINE,
  buildCourseOutline,
  locateLesson,
  pickMainCourse,
  type CourseOutline,
  type CourseOutlineRow,
  type LessonLocation,
  type OutlineModule,
} from '@/lib/curriculum';
import { useAuthUser } from './useAuthUser';

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  estimated_hours: number | null;
  difficulty: string | null;
  is_free: boolean | null;
}

export interface CourseEntry {
  course: CourseSummary;
  outline: CourseOutline;
}

export interface CourseCatalog {
  /** Published courses in creation order, each with its outline. */
  entries: CourseEntry[];
  /** The curriculum course (or the first published course). */
  main: CourseEntry | null;
}

const COURSE_COLUMNS = 'id, slug, title, description, thumbnail_url, estimated_hours, difficulty, is_free';

async function fetchCourseOutline(slug: string): Promise<CourseOutline> {
  const { data, error } = await databaseRpc<CourseOutlineRow[]>('get_course_outline', { course_slug: slug });
  if (error) throw error;
  return buildCourseOutline(data ?? []);
}

async function fetchCatalog(): Promise<CourseCatalog> {
  try {
    const { data, error } = await supabase.from('courses').select(COURSE_COLUMNS).eq('is_published', true).order('created_at');
    if (error) throw error;
    const courses: CourseSummary[] = data ?? [];
    const outlines = await Promise.all(courses.map((course) => fetchCourseOutline(course.slug)));
    const entries = courses.map((course, index) => ({ course, outline: outlines[index] }));
    const main = pickMainCourse(courses);
    return { entries, main: entries.find((entry) => entry.course.id === main?.id) ?? null };
  } catch (error) {
    console.error('[useCourseCatalog] could not load courses and outlines', error);
    throw error;
  }
}

export const courseCatalogKey = (userId: string | undefined) => ['course-catalog', userId ?? null] as const;

/**
 * Published courses with their outlines (`get_course_outline`): titles of every lesson,
 * with `accessible` telling which ones the learner's plan opens.
 */
export function useCourseCatalog() {
  const { data: user } = useAuthUser();
  return useQuery({
    queryKey: courseCatalogKey(user?.id),
    queryFn: fetchCatalog,
    enabled: Boolean(user),
    staleTime: 60_000,
  });
}

export const completedLessonsKey = (userId: string | undefined) => ['completed-lessons', userId ?? null] as const;

/** Ids of the lessons the learner has completed. */
export function useCompletedLessons() {
  const { data: user } = useAuthUser();
  const userId = user?.id;
  return useQuery({
    queryKey: completedLessonsKey(userId),
    queryFn: async (): Promise<ReadonlySet<string>> => {
      if (!userId) return new Set<string>();
      const { data, error } = await supabase.from('lesson_progress').select('lesson_id').eq('user_id', userId).eq('completed', true);
      if (error) {
        console.error('[useCompletedLessons] could not load progress', error);
        throw error;
      }
      return new Set((data ?? []).map((row) => row.lesson_id));
    },
    enabled: Boolean(userId),
  });
}

/**
 * Outline of a module that belongs to no course (the outline RPC is per course). Only lessons
 * the learner can open are visible here, so they are all marked accessible.
 */
async function fetchStandaloneModuleOutline(moduleId: string): Promise<CourseOutline> {
  const [moduleResult, lessonsResult] = await Promise.all([
    supabase
      .from('modules')
      .select('id, code, title, description, order_index, hours_label, trails, project_title, is_star')
      .eq('id', moduleId)
      .maybeSingle(),
    supabase
      .from('lessons')
      .select('id, title, description, order_index, type, estimated_minutes, duration_minutes, is_free')
      .eq('module_id', moduleId)
      .order('order_index'),
  ]);
  const error = moduleResult.error ?? lessonsResult.error;
  if (error) {
    console.error('[useStandaloneModuleOutline] could not load module', moduleId, error);
    throw error;
  }
  const module = moduleResult.data;
  if (!module) return EMPTY_OUTLINE;
  const base: CourseOutlineRow = {
    course_id: '',
    module_id: module.id,
    module_code: module.code,
    module_title: module.title,
    module_description: module.description,
    module_order: module.order_index,
    module_hours_label: module.hours_label,
    module_trails: module.trails,
    module_project_title: module.project_title,
    module_is_star: module.is_star,
    lesson_id: null,
    lesson_title: null,
    lesson_description: null,
    lesson_order: null,
    lesson_type: null,
    estimated_minutes: null,
    is_free: null,
    accessible: null,
  };
  const lessons = lessonsResult.data ?? [];
  if (lessons.length === 0) return buildCourseOutline([base]);
  return buildCourseOutline(
    lessons.map((lesson) => ({
      ...base,
      lesson_id: lesson.id,
      lesson_title: lesson.title,
      lesson_description: lesson.description,
      lesson_order: lesson.order_index,
      lesson_type: lesson.type,
      estimated_minutes: lesson.estimated_minutes ?? lesson.duration_minutes,
      is_free: lesson.is_free,
      accessible: true,
    })),
  );
}

function useStandaloneModuleOutline(moduleId: string | null) {
  const { data: user } = useAuthUser();
  return useQuery({
    queryKey: ['standalone-module-outline', user?.id ?? null, moduleId],
    queryFn: () => fetchStandaloneModuleOutline(moduleId ?? ''),
    enabled: Boolean(user && moduleId),
    staleTime: 60_000,
  });
}

export interface ModuleContext {
  course: CourseSummary | null;
  outline: CourseOutline;
  module: OutlineModule;
}

function findModule(catalog: CourseCatalog, moduleId: string): ModuleContext | null {
  for (const entry of catalog.entries) {
    const module = entry.outline.modules.find((candidate) => candidate.id === moduleId);
    if (module) return { course: entry.course, outline: entry.outline, module };
  }
  return null;
}

interface ContextState<T> {
  data: T | null;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
}

/** A module with its course outline; modules outside any course fall back to their own lessons. */
export function useModuleContext(moduleId: string | undefined): ContextState<ModuleContext> {
  const catalog = useCourseCatalog();
  const found = catalog.data && moduleId ? findModule(catalog.data, moduleId) : null;
  const standaloneId = catalog.data && moduleId && !found ? moduleId : null;
  const standalone = useStandaloneModuleOutline(standaloneId);
  const standaloneModule = standalone.data?.modules[0];
  return {
    data: found ?? (standalone.data && standaloneModule ? { course: null, outline: standalone.data, module: standaloneModule } : null),
    isPending: catalog.isPending || (standaloneId !== null && standalone.isPending),
    isError: catalog.isError || standalone.isError,
    refetch: () => {
      void catalog.refetch();
      if (standalone.isError) void standalone.refetch();
    },
  };
}

export interface LessonContext extends LessonLocation {
  course: CourseSummary | null;
  outline: CourseOutline;
}

function findLesson(catalog: CourseCatalog, lessonId: string): LessonContext | null {
  for (const entry of catalog.entries) {
    const location = locateLesson(entry.outline, lessonId);
    if (location) return { ...location, course: entry.course, outline: entry.outline };
  }
  return null;
}

/**
 * Where a lesson sits in its course. `fallbackModuleId` (the lesson row's module) is used
 * only when no course outline lists the lesson.
 */
export function useLessonContext(lessonId: string | undefined, fallbackModuleId: string | null): ContextState<LessonContext> {
  const catalog = useCourseCatalog();
  const found = catalog.data && lessonId ? findLesson(catalog.data, lessonId) : null;
  const standaloneId = catalog.data && lessonId && !found ? fallbackModuleId : null;
  const standalone = useStandaloneModuleOutline(standaloneId);
  const standaloneLocation = standalone.data && lessonId ? locateLesson(standalone.data, lessonId) : null;
  return {
    data: found ?? (standalone.data && standaloneLocation ? { ...standaloneLocation, course: null, outline: standalone.data } : null),
    isPending: catalog.isPending || (standaloneId !== null && standalone.isPending),
    isError: catalog.isError || standalone.isError,
    refetch: () => {
      void catalog.refetch();
      if (standalone.isError) void standalone.refetch();
    },
  };
}

/** `modules.intro` (Markdown presentation of the module); not part of the outline RPC. */
export function useModuleIntro(moduleId: string | undefined) {
  const { data: user } = useAuthUser();
  return useQuery({
    queryKey: ['module-intro', user?.id ?? null, moduleId ?? null],
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase.from('modules').select('intro').eq('id', moduleId ?? '').maybeSingle();
      if (error) {
        console.error('[useModuleIntro] could not load module intro', moduleId, error);
        throw error;
      }
      return data?.intro?.trim() || null;
    },
    enabled: Boolean(user && moduleId),
    staleTime: 5 * 60_000,
  });
}
