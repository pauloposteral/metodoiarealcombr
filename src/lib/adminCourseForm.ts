import type { TablesInsert } from '@/integrations/supabase/types';
import { parseDateOnly } from './dateOnly.ts';

/**
 * Form state, validation and payloads of the course/module/lesson editor in /admin/cursos.
 * Pure so the rules (slug, https-only links, review date) are covered by Node tests.
 */

export type CourseItemMode = 'course' | 'module' | 'lesson';

export const LESSON_TYPE_LABELS: Record<string, string> = {
  text: 'Texto',
  project: 'Projeto',
  video: 'Vídeo',
  quiz: 'Quiz',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export interface CourseItemForm {
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  hours: string;
  thumbnailUrl: string;
  published: boolean;
  free: boolean;
  minutes: string;
  type: string;
  content: string;
  videoUrl: string;
  /** AAAA-MM-DD from the date input, or empty. */
  reviewedAt: string;
}

export interface CourseItemSource {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  difficulty?: string | null;
  estimated_hours?: number | null;
  thumbnail_url?: string | null;
  is_published?: boolean | null;
  is_free?: boolean | null;
  estimated_minutes?: number | null;
  type?: string | null;
  content?: string | null;
  video_url?: string | null;
  reviewed_at?: string | null;
}

export function toCourseItemForm(item: CourseItemSource | null): CourseItemForm {
  return {
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    description: item?.description ?? '',
    difficulty: item?.difficulty && item.difficulty in DIFFICULTY_LABELS ? item.difficulty : 'beginner',
    hours: item?.estimated_hours != null ? String(item.estimated_hours) : '',
    thumbnailUrl: item?.thumbnail_url ?? '',
    published: item?.is_published ?? true,
    free: item?.is_free ?? false,
    minutes: item ? (item.estimated_minutes != null ? String(item.estimated_minutes) : '') : '10',
    type: item?.type && item.type in LESSON_TYPE_LABELS ? item.type : 'text',
    content: item?.content ?? '',
    videoUrl: item?.video_url ?? '',
    reviewedAt: item?.reviewed_at?.slice(0, 10) ?? '',
  };
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Returns the first problem as a pt-BR message, or null when the form can be saved. */
export function validateCourseItemForm(mode: CourseItemMode, form: CourseItemForm): string | null {
  if (!form.title.trim()) return 'Informe o título.';
  if (mode === 'course') {
    const slug = form.slug.trim() || generateSlug(form.title);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return 'O slug deve ter só letras minúsculas, números e hífens.';
    if (form.hours.trim() && !(Number(form.hours) >= 0)) return 'Horas estimadas deve ser um número positivo.';
    if (form.thumbnailUrl.trim() && !isHttpsUrl(form.thumbnailUrl.trim())) return 'A URL da thumbnail deve começar com https://.';
  }
  if (mode === 'lesson') {
    if (form.minutes.trim() && !/^\d{1,3}$/.test(form.minutes.trim())) return 'A duração deve ser um número inteiro de minutos.';
    if (form.videoUrl.trim() && !isHttpsUrl(form.videoUrl.trim())) return 'A URL do vídeo deve começar com https://.';
    if (form.reviewedAt && !parseDateOnly(form.reviewedAt)) return 'Data de revisão inválida.';
  }
  return null;
}

const orNull = (value: string): string | null => (value.trim() ? value.trim() : null);

export function buildCoursePayload(form: CourseItemForm): TablesInsert<'courses'> {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || generateSlug(form.title),
    description: orNull(form.description),
    difficulty: form.difficulty,
    estimated_hours: form.hours.trim() ? Number(form.hours) : null,
    thumbnail_url: orNull(form.thumbnailUrl),
    is_published: form.published,
    is_free: form.free,
  };
}

/** Existing modules keep their slug: imported modules are matched by code/slug on re-import. */
export function buildModulePayload(form: CourseItemForm, context: { courseId: string; orderIndex: number; existingSlug?: string | null }): TablesInsert<'modules'> {
  return {
    title: form.title.trim(),
    description: orNull(form.description),
    course_id: context.courseId,
    is_published: form.published,
    order_index: context.orderIndex,
    slug: context.existingSlug || generateSlug(form.title),
  };
}

export function buildLessonPayload(form: CourseItemForm, context: { moduleId: string; orderIndex: number }): TablesInsert<'lessons'> {
  return {
    title: form.title.trim(),
    description: orNull(form.description),
    module_id: context.moduleId,
    estimated_minutes: form.minutes.trim() ? Number.parseInt(form.minutes, 10) : 10,
    is_free: form.free,
    type: form.type,
    content: form.content.trim() ? form.content : null,
    video_url: orNull(form.videoUrl),
    reviewed_at: form.reviewedAt || null,
    order_index: context.orderIndex,
  };
}

/** Next position at the end of a list, robust to gaps left by deletions. */
export function nextOrderIndex(items: ReadonlyArray<{ order_index: number }>): number {
  return items.reduce((max, item) => Math.max(max, item.order_index + 1), 0);
}

function errorFields(error: unknown): { code?: unknown; message?: unknown } {
  return typeof error === 'object' && error !== null ? (error as { code?: unknown; message?: unknown }) : {};
}

export function describeSaveError(error: unknown): string {
  const { code, message } = errorFields(error);
  if (code === '23505') return 'Já existe um item com esse slug ou código neste curso.';
  if (code === '42501') return 'Sem permissão para salvar. Entre com uma conta de administrador.';
  return typeof message === 'string' && message ? message : 'Não foi possível salvar. Tente de novo.';
}

export function describeDeleteError(error: unknown): string {
  const { code } = errorFields(error);
  if (code === '23503') return 'Não é possível excluir: há registros ligados a este item (aulas, quizzes ou progresso de alunos).';
  if (code === '42501') return 'Sem permissão para excluir. Entre com uma conta de administrador.';
  return 'Não foi possível excluir. Tente de novo.';
}
