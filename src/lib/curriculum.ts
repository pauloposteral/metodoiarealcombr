/**
 * Curriculum domain rules shared by the members area.
 * Trail composition mirrors the public landing page (see LandingV2 TRAILS) and the
 * `modules.trails` column filled by the curriculum import.
 * WHY: hour labels come from the real lesson minutes of curriculum 2026.09.24
 * (the landing still shows the older estimates of ~15–18h per trail and ~36h in total).
 */

export const TRACK_KEYS = ['carreira', 'empreendedor', 'criador', 'construtor', 'completa'] as const;
export type TrackKey = (typeof TRACK_KEYS)[number];
export type TrailKey = Exclude<TrackKey, 'completa'>;

export interface TrackDefinition {
  key: TrackKey;
  label: string;
  shortLabel: string;
  hoursLabel: string;
  description: string;
  /** Module codes in study order. */
  moduleCodes: string[];
  /** Codes highlighted as the core of the track. */
  highlightCodes: string[];
}

const ALL_MODULE_CODES = Array.from({ length: 13 }, (_, i) => `MOD-${String(i).padStart(2, '0')}`);

export const TRACKS: Record<TrackKey, TrackDefinition> = {
  carreira: {
    key: 'carreira',
    label: 'Carreira / CLT',
    shortLabel: 'Carreira',
    hoursLabel: '~18h30',
    description: 'Para se valorizar no emprego, ganhar horas na semana e usar a IA a seu favor amanhã de manhã.',
    moduleCodes: ['MOD-00', 'MOD-01', 'MOD-02', 'MOD-03', 'MOD-05', 'MOD-10', 'MOD-12'],
    highlightCodes: ['MOD-10'],
  },
  empreendedor: {
    key: 'empreendedor',
    label: 'Empreendedor',
    shortLabel: 'Empreendedor',
    hoursLabel: '~19h30',
    description: 'Para vender mais e gastar menos: conteúdo, atendimento e automação com IA dentro do próprio negócio.',
    moduleCodes: ['MOD-00', 'MOD-01', 'MOD-02', 'MOD-03', 'MOD-09', 'MOD-11', 'MOD-12'],
    highlightCodes: ['MOD-09', 'MOD-11'],
  },
  criador: {
    key: 'criador',
    label: 'Criador de conteúdo',
    shortLabel: 'Criador',
    hoursLabel: '~19h',
    description: 'Para produzir em escala sem soar genérico: imagem, vídeo, voz e um sistema de conteúdo com a sua identidade.',
    moduleCodes: ['MOD-00', 'MOD-01', 'MOD-02', 'MOD-06', 'MOD-07', 'MOD-11', 'MOD-12'],
    highlightCodes: ['MOD-06', 'MOD-07'],
  },
  construtor: {
    key: 'construtor',
    label: 'Construtor de apps',
    shortLabel: 'Construtor',
    hoursLabel: '~19h30',
    description: 'Para publicar apps e produtos sem escrever código, do primeiro micro-app ao início de um micro-SaaS.',
    moduleCodes: ['MOD-00', 'MOD-01', 'MOD-02', 'MOD-04', 'MOD-08', 'MOD-09', 'MOD-12'],
    highlightCodes: ['MOD-08'],
  },
  completa: {
    key: 'completa',
    label: 'Formação completa',
    shortLabel: 'Completa',
    hoursLabel: '~37h30',
    description: 'Os 13 módulos na ordem, do primeiro prompt ao portfólio publicado.',
    moduleCodes: ALL_MODULE_CODES,
    highlightCodes: ['MOD-08'],
  },
};

/** Share of the track's lessons required for the certificate (server rule mirrors this). */
export const CERTIFICATE_TRACK_THRESHOLD = 0.75;
/** Content review cycle promised on the landing page (RN-005). */
export const REVIEW_CYCLE_DAYS = 90;

export function isTrackKey(value: unknown): value is TrackKey {
  return typeof value === 'string' && (TRACK_KEYS as readonly string[]).includes(value);
}

/** Extracts `MOD-NN` from the code column or, for legacy rows, from the title prefix. */
export function moduleCode(module: { code?: string | null; title?: string | null }): string | null {
  if (module.code && /^MOD-\d{2}$/.test(module.code)) return module.code;
  const match = module.title?.match(/^MOD-(\d{2})\b/);
  return match ? `MOD-${match[1]}` : null;
}

/** Title without the legacy "MOD-NN " prefix. */
export function moduleDisplayTitle(module: { title: string }): string {
  return module.title.replace(/^MOD-\d{2}\s*[—–-]?\s*/, '').replace(/^⭐\s*/, '');
}

export function isModuleInTrack(module: { code?: string | null; title?: string | null; trails?: string[] | null }, track: TrackKey | null | undefined): boolean {
  if (!track || track === 'completa') return true;
  const code = moduleCode(module);
  if (code) return TRACKS[track].moduleCodes.includes(code);
  return Boolean(module.trails?.includes(track));
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "set/2026" style seal used on lessons ("Atualizado em set/2026"). */
export function formatMonthYear(value: string | null | undefined): string | null {
  const date = value ? parseDateOnly(value) : null;
  return date ? `${MONTHS[date.getUTCMonth()]}/${date.getUTCFullYear()}` : null;
}

export function nextReviewDate(reviewedAt: string | null | undefined): string | null {
  const date = reviewedAt ? parseDateOnly(reviewedAt) : null;
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + REVIEW_CYCLE_DAYS);
  return date.toISOString().slice(0, 10);
}

/** True when the 90-day review window has passed (content should show a "em revisão" hint). */
export function isReviewOverdue(reviewedAt: string | null | undefined, today = new Date()): boolean {
  const next = nextReviewDate(reviewedAt);
  return next !== null && next < today.toISOString().slice(0, 10);
}

export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`;
}

export interface OrderedLesson {
  id: string;
  module_id: string;
  order_index: number;
}

export interface OrderedModule {
  id: string;
  order_index: number;
}

/** Flattens lessons in course order (module order, then lesson order) for prev/next navigation. */
export function orderLessons<L extends OrderedLesson>(modules: OrderedModule[], lessons: L[]): L[] {
  const moduleOrder = new Map(modules.map((m) => [m.id, m.order_index]));
  return lessons
    .filter((lesson) => moduleOrder.has(lesson.module_id))
    .sort((a, b) => (moduleOrder.get(a.module_id)! - moduleOrder.get(b.module_id)!) || (a.order_index - b.order_index));
}

export const TRAIL_KEYS: readonly TrailKey[] = ['carreira', 'empreendedor', 'criador', 'construtor'];

export function isTrailKey(value: unknown): value is TrailKey {
  return isTrackKey(value) && value !== 'completa';
}

/** Trails (the four profiles, not the full formation) that include the module. */
export function moduleTrails(module: { code?: string | null; title?: string | null; trails?: string[] | null }): TrailKey[] {
  return TRAIL_KEYS.filter((trail) => isModuleInTrack(module, trail));
}

/** "~15h" → 15, "~2h30" → 2.5; null for anything else. */
export function hoursLabelToHours(label: string | null | undefined): number | null {
  const match = label ? /^~(\d+)h(\d{2})?$/.exec(label) : null;
  return match ? Number(match[1]) + Number(match[2] ?? 0) / 60 : null;
}

// ---------------------------------------------------------------------------
// Course outline (`get_course_outline`)
// ---------------------------------------------------------------------------

/** Main course id from the import pack (`curso.json`); the import keeps it across environments. */
export const CURRICULUM_COURSE_ID = '0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7';

/** Row of `get_course_outline(course_slug)`: one per lesson, `lesson_*` null for a module without lessons. */
export interface CourseOutlineRow {
  course_id: string;
  module_id: string;
  module_code: string | null;
  module_title: string;
  module_description: string | null;
  module_order: number;
  module_hours_label: string | null;
  module_trails: string[] | null;
  module_project_title: string | null;
  module_is_star: boolean | null;
  lesson_id: string | null;
  lesson_title: string | null;
  lesson_description: string | null;
  lesson_order: number | null;
  lesson_type: string | null;
  estimated_minutes: number | null;
  is_free: boolean | null;
  accessible: boolean | null;
}

export interface OutlineLesson {
  id: string;
  module_id: string;
  order_index: number;
  title: string;
  description: string | null;
  type: string | null;
  minutes: number;
  is_free: boolean;
  /** False when the learner's plan does not open the lesson (titles stay visible). */
  accessible: boolean;
}

export interface OutlineModule {
  id: string;
  order_index: number;
  /** `MOD-NN` from the code column or the legacy title prefix. */
  code: string | null;
  title: string;
  displayTitle: string;
  description: string | null;
  hours_label: string | null;
  trails: TrailKey[];
  project_title: string | null;
  is_star: boolean;
  lessons: OutlineLesson[];
}

export interface CourseOutline {
  courseId: string | null;
  /** Modules in course order. */
  modules: OutlineModule[];
  /** Every lesson in course order: module order, then lesson order. */
  lessons: OutlineLesson[];
}

export const EMPTY_OUTLINE: CourseOutline = { courseId: null, modules: [], lessons: [] };

export function buildCourseOutline(rows: readonly CourseOutlineRow[]): CourseOutline {
  const modules = new Map<string, OutlineModule>();
  const seenLessons = new Set<string>();
  let courseId: string | null = null;
  for (const row of rows) {
    if (courseId === null) courseId = row.course_id;
    let module = modules.get(row.module_id);
    if (!module) {
      module = {
        id: row.module_id,
        order_index: row.module_order,
        code: moduleCode({ code: row.module_code, title: row.module_title }),
        title: row.module_title,
        displayTitle: moduleDisplayTitle({ title: row.module_title }),
        description: row.module_description,
        hours_label: row.module_hours_label,
        trails: (row.module_trails ?? []).filter(isTrailKey),
        project_title: row.module_project_title,
        is_star: row.module_is_star === true,
        lessons: [],
      };
      modules.set(row.module_id, module);
    }
    if (row.lesson_id && !seenLessons.has(row.lesson_id)) {
      seenLessons.add(row.lesson_id);
      module.lessons.push({
        id: row.lesson_id,
        module_id: row.module_id,
        order_index: row.lesson_order ?? 0,
        title: row.lesson_title ?? '',
        description: row.lesson_description,
        type: row.lesson_type,
        minutes: row.estimated_minutes ?? 0,
        is_free: row.is_free === true,
        accessible: row.accessible === true,
      });
    }
  }
  const ordered = [...modules.values()].sort(
    (a, b) => a.order_index - b.order_index || (a.code ?? '').localeCompare(b.code ?? '') || a.title.localeCompare(b.title),
  );
  ordered.forEach((module) => module.lessons.sort((a, b) => a.order_index - b.order_index));
  // Position (not order_index) keeps two modules with the same order_index from interleaving.
  const positions = ordered.map((module, index) => ({ id: module.id, order_index: index }));
  return { courseId, modules: ordered, lessons: orderLessons(positions, ordered.flatMap((module) => module.lessons)) };
}

export function isProjectLesson(lesson: { type: string | null }): boolean {
  return lesson.type === 'project';
}

/** The module's project lesson (the last `project` lesson), if any. */
export function moduleProjectLesson(module: OutlineModule): OutlineLesson | null {
  return [...module.lessons].reverse().find(isProjectLesson) ?? null;
}

/** Curriculum modules (with a `MOD-NN` code); before the import, when none has one, every module. */
export function curriculumModules<M extends { code: string | null }>(modules: readonly M[]): M[] {
  return modules.some((module) => module.code) ? modules.filter((module) => module.code) : [...modules];
}

export function modulesForTrack(outline: CourseOutline, track: TrackKey | null | undefined): OutlineModule[] {
  return outline.modules.filter((module) => isModuleInTrack(module, track));
}

/** Lessons of the track's modules in study order; the whole course when the track matches nothing. */
export function lessonsForTrack(outline: CourseOutline, track: TrackKey | null | undefined): OutlineLesson[] {
  const moduleIds = new Set(modulesForTrack(outline, track).map((module) => module.id));
  const lessons = outline.lessons.filter((lesson) => moduleIds.has(lesson.module_id));
  return lessons.length > 0 ? lessons : outline.lessons;
}

/** "Continuar de onde parei": first incomplete lesson the learner can open, track first, then the rest of the course. */
export function findResumeLesson(
  outline: CourseOutline,
  track: TrackKey | null | undefined,
  completed: ReadonlySet<string>,
): OutlineLesson | null {
  const pending = (lesson: OutlineLesson) => lesson.accessible && !completed.has(lesson.id);
  return lessonsForTrack(outline, track).find(pending) ?? outline.lessons.find(pending) ?? null;
}

export interface ProgressSummary {
  total: number;
  completed: number;
  /** 0–100, rounded down so 99.6% never shows as done. */
  percent: number;
  minutes: number;
}

export function summarizeProgress(lessons: readonly { id: string; minutes: number }[], completed: ReadonlySet<string>): ProgressSummary {
  const done = lessons.filter((lesson) => completed.has(lesson.id)).length;
  return {
    total: lessons.length,
    completed: done,
    percent: lessons.length === 0 ? 0 : Math.floor((done / lessons.length) * 100),
    minutes: lessons.reduce((sum, lesson) => sum + lesson.minutes, 0),
  };
}

export interface LessonLocation {
  module: OutlineModule;
  lesson: OutlineLesson;
  /** 1-based position inside the module ("Aula X de Y"). */
  position: number;
  moduleLessonCount: number;
}

export function locateLesson(outline: CourseOutline, lessonId: string): LessonLocation | null {
  for (const module of outline.modules) {
    const index = module.lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index !== -1) return { module, lesson: module.lessons[index], position: index + 1, moduleLessonCount: module.lessons.length };
  }
  return null;
}

export interface LessonNavigation {
  previous: OutlineLesson | null;
  next: OutlineLesson | null;
  /** Module of `next` when it starts another module ("Próximo módulo: MOD-04 · …"). */
  nextModule: OutlineModule | null;
  /** True only for the course's last lesson (shows "Ver certificado"). */
  isLastLesson: boolean;
}

/** Prev/next in course order: module order, then lesson order, crossing module boundaries. */
export function lessonNavigation(outline: CourseOutline, lessonId: string): LessonNavigation {
  const index = outline.lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index === -1) return { previous: null, next: null, nextModule: null, isLastLesson: false };
  const current = outline.lessons[index];
  const next = outline.lessons[index + 1] ?? null;
  const nextModule = next && next.module_id !== current.module_id
    ? outline.modules.find((module) => module.id === next.module_id) ?? null
    : null;
  return { previous: outline.lessons[index - 1] ?? null, next, nextModule, isLastLesson: next === null };
}

/** "Trilha Carreira / CLT" or "Formação completa" (null means the full formation). */
export function trackDisplayName(track: TrackKey | null | undefined): string {
  return !track || track === 'completa' ? TRACKS.completa.label : `Trilha ${TRACKS[track].label}`;
}

// ---------------------------------------------------------------------------
// Courses and certificate
// ---------------------------------------------------------------------------

/** The curriculum course when published, otherwise the first published course. */
export function pickMainCourse<C extends { id: string }>(courses: readonly C[]): C | null {
  return courses.find((course) => course.id === CURRICULUM_COURSE_ID) ?? courses[0] ?? null;
}

/** Row of `get_certificate_status()`. */
export interface CertificateStatus {
  track: string | null;
  /** Lessons that count for the learner's track (the 75% applies to this number). */
  required_lessons: number;
  completed_lessons: number;
  threshold_percent: number;
  final_project_lesson_id: string | null;
  final_project_done: boolean;
  eligible: boolean;
  total_minutes: number | null;
}

export interface CertificateRequirements {
  track: TrackKey;
  totalLessons: number;
  completedLessons: number;
  /** Lessons needed to meet the threshold (ceil of total × threshold). */
  neededLessons: number;
  thresholdPercent: number;
  lessonsMet: boolean;
  /** MOD-12 project lesson; null under the legacy rule (curriculum not imported yet). */
  finalProjectLessonId: string | null;
  projectMet: boolean;
  /** Progress towards `neededLessons`, 0–100. */
  percentOfGoal: number;
  eligible: boolean;
}

export function certificateRequirements(status: CertificateStatus): CertificateRequirements {
  const totalLessons = Math.max(0, status.required_lessons);
  const thresholdPercent = status.threshold_percent > 0 ? status.threshold_percent : CERTIFICATE_TRACK_THRESHOLD * 100;
  const neededLessons = Math.ceil((totalLessons * thresholdPercent) / 100);
  const completedLessons = Math.min(Math.max(0, status.completed_lessons), totalLessons || status.completed_lessons);
  return {
    track: isTrackKey(status.track) ? status.track : 'completa',
    totalLessons,
    completedLessons,
    neededLessons,
    thresholdPercent,
    lessonsMet: neededLessons > 0 && completedLessons >= neededLessons,
    finalProjectLessonId: status.final_project_lesson_id,
    projectMet: status.final_project_done,
    percentOfGoal: neededLessons === 0 ? 0 : Math.min(100, Math.floor((completedLessons / neededLessons) * 100)),
    eligible: status.eligible,
  };
}
