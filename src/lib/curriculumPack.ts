import { z } from 'zod';

/**
 * Contract of the curriculum import pack produced by `scripts/curriculum/build-pack.mjs`
 * and consumed by /admin/cursos. The server re-checks admin rights and types; this schema
 * gives the admin a clear error before anything is written.
 */
export const CURRICULUM_PACK_FORMAT = 'metodo-ia-real/curriculum@1';

const uuid = z.string().uuid();
const trail = z.enum(['carreira', 'empreendedor', 'criador', 'construtor']);

export const QuizQuestionSchema = z.object({
  question: z.string().min(5).max(500),
  options: z.array(z.string().min(1).max(300)).min(3).max(4),
  correct: z.number().int().min(0).max(3),
  explanation: z.string().min(20).max(1000),
}).refine((q) => q.correct < q.options.length, { message: 'Resposta correta fora das opções' });

export const PackLessonSchema = z.object({
  id: uuid,
  slug: z.string().regex(/^mod-\d{2}-\d{2}-[a-z0-9-]+$/),
  order_index: z.number().int().min(0).max(99),
  title: z.string().min(5).max(90),
  description: z.string().min(20).max(200),
  content: z.string().min(200).max(60000),
  prompts: z.array(z.string().min(20).max(4000)).max(8),
  type: z.enum(['text', 'project']),
  estimated_minutes: z.number().int().min(1).max(120),
  is_free: z.boolean(),
  reviewed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quiz: z.object({
    id: uuid,
    title: z.string().min(3).max(120),
    questions: z.array(QuizQuestionSchema).min(1).max(10),
    passing_score: z.number().min(0).max(100),
    max_attempts: z.number().int().min(1).max(10),
  }).nullable(),
});

export const PackModuleSchema = z.object({
  id: uuid,
  code: z.string().regex(/^MOD-\d{2}$/),
  order_index: z.number().int().min(0).max(12),
  slug: z.string().regex(/^mod-\d{2}-[a-z0-9-]+$/),
  title: z.string().min(5).max(80),
  description: z.string().min(30).max(300),
  intro: z.string().max(4000),
  hours_label: z.string().regex(/^~\d+h(\d{2})?$/),
  trails: z.array(trail).min(1),
  project_title: z.string().min(10).max(160),
  is_star: z.boolean(),
  lessons: z.array(PackLessonSchema).min(1).max(20),
});

export const CurriculumPackSchema = z.object({
  format: z.literal(CURRICULUM_PACK_FORMAT),
  version: z.string().min(4).max(40),
  generated_at: z.string(),
  course: z.object({
    id: uuid,
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(3).max(120),
    description: z.string().max(600),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimated_hours: z.number().min(0).max(500),
    tags: z.array(z.string().max(40)).max(30),
  }),
  modules: z.array(PackModuleSchema).min(1).max(20),
}).superRefine((pack, ctx) => {
  const moduleCodes = new Set<string>();
  const lessonIds = new Set<string>();
  pack.modules.forEach((module, mi) => {
    if (moduleCodes.has(module.code)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Módulo ${module.code} repetido`, path: ['modules', mi, 'code'] });
    moduleCodes.add(module.code);
    module.lessons.forEach((lesson, li) => {
      if (lessonIds.has(lesson.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Aula ${lesson.slug} repetida`, path: ['modules', mi, 'lessons', li, 'id'] });
      lessonIds.add(lesson.id);
    });
  });
});

export type CurriculumPack = z.infer<typeof CurriculumPackSchema>;
export type PackModule = z.infer<typeof PackModuleSchema>;

export interface PackSummary {
  version: string;
  modules: number;
  lessons: number;
  projects: number;
  questions: number;
  prompts: number;
  minutes: number;
}

export function summarizePack(pack: CurriculumPack): PackSummary {
  const lessons = pack.modules.flatMap((m) => m.lessons);
  return {
    version: pack.version,
    modules: pack.modules.length,
    lessons: lessons.length,
    projects: lessons.filter((l) => l.type === 'project').length,
    questions: lessons.reduce((sum, l) => sum + (l.quiz?.questions.length ?? 0), 0),
    prompts: lessons.reduce((sum, l) => sum + l.prompts.length, 0),
    minutes: lessons.reduce((sum, l) => sum + l.estimated_minutes, 0),
  };
}

/** Parses raw file text into a validated pack, returning readable issues on failure. */
export function parseCurriculumPack(text: string): { pack: CurriculumPack } | { issues: string[] } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { issues: ['O arquivo não é um JSON válido.'] };
  }
  const result = CurriculumPackSchema.safeParse(raw);
  if (result.success) return { pack: result.data };
  return {
    issues: result.error.issues.slice(0, 20).map((issue) => `${issue.path.join('.') || 'pacote'}: ${issue.message}`),
  };
}
