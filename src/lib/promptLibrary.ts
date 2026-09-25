import { isModuleInTrack, moduleCode, moduleDisplayTitle, type TrackKey } from './curriculum.ts';
import { buildHaystack, matchesTokens, searchTokens } from './textSearch.ts';

/**
 * Prompt library (/membros/prompts): every prompt of the lessons the learner can open.
 * Row-level security decides which lessons come back, so this module only aggregates,
 * orders and filters what the database returned.
 */

export interface PromptLessonRow {
  id: string;
  title: string;
  prompts: string[] | null;
  module_id: string;
  order_index: number;
}

export interface PromptModuleRow {
  id: string;
  code: string | null;
  title: string;
  order_index: number;
  trails: string[] | null;
}

export interface PromptModule {
  id: string;
  /** `MOD-NN` from the code column or the legacy title prefix. */
  code: string | null;
  title: string;
  order: number;
  trails: string[];
  source: PromptModuleRow;
}

export interface PromptEntry {
  /** Stable key: lesson id + position of the prompt in the lesson. */
  key: string;
  text: string;
  /** 1-based position of the prompt inside its lesson. */
  position: number;
  lessonId: string;
  lessonTitle: string;
  module: PromptModule;
  haystack: string;
}

export interface PromptModuleGroup {
  module: PromptModule;
  entries: PromptEntry[];
}

export interface PromptLibrary {
  entries: PromptEntry[];
  /** Modules that have at least one prompt, in course order. */
  modules: PromptModule[];
  /** Lessons that contributed at least one prompt. */
  lessonCount: number;
  /** Published modules without any lesson visible to this learner (locked for free accounts). */
  lockedModuleCount: number;
}

function toPromptModule(row: PromptModuleRow): PromptModule {
  return {
    id: row.id,
    code: moduleCode(row),
    title: moduleDisplayTitle(row),
    order: row.order_index,
    trails: row.trails ?? [],
    source: row,
  };
}

export function buildPromptLibrary(moduleRows: readonly PromptModuleRow[], lessonRows: readonly PromptLessonRow[]): PromptLibrary {
  const modulesById = new Map(moduleRows.map((row) => [row.id, toPromptModule(row)]));
  const lessons = lessonRows
    .filter((lesson) => modulesById.has(lesson.module_id))
    .sort((a, b) => (modulesById.get(a.module_id)!.order - modulesById.get(b.module_id)!.order) || (a.order_index - b.order_index) || a.title.localeCompare(b.title, 'pt-BR'));

  const entries: PromptEntry[] = [];
  const lessonsWithPrompts = new Set<string>();
  for (const lesson of lessons) {
    const module = modulesById.get(lesson.module_id)!;
    (lesson.prompts ?? []).forEach((prompt, index) => {
      const text = prompt.trim();
      if (!text) return;
      lessonsWithPrompts.add(lesson.id);
      entries.push({
        key: `${lesson.id}:${index}`,
        text,
        position: index + 1,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        module,
        haystack: buildHaystack([text, lesson.title, module.title, module.code]),
      });
    });
  }

  const modulesWithLessons = new Set(lessonRows.map((lesson) => lesson.module_id));
  const promptModuleIds = new Set(entries.map((entry) => entry.module.id));
  return {
    entries,
    modules: [...modulesById.values()].filter((module) => promptModuleIds.has(module.id)).sort((a, b) => a.order - b.order),
    lessonCount: lessonsWithPrompts.size,
    lockedModuleCount: moduleRows.filter((row) => !modulesWithLessons.has(row.id)).length,
  };
}

export interface PromptFilters {
  query: string;
  /** Module id, or null for every module. */
  moduleId: string | null;
  /** Learner track; null or "completa" keeps every module. */
  track: TrackKey | null;
}

export function isPromptModuleInTrack(module: PromptModule, track: TrackKey | null): boolean {
  return isModuleInTrack(module.source, track);
}

export function filterPromptEntries(entries: readonly PromptEntry[], filters: PromptFilters): PromptEntry[] {
  const tokens = searchTokens(filters.query);
  return entries.filter((entry) =>
    (filters.moduleId === null || entry.module.id === filters.moduleId)
    && isPromptModuleInTrack(entry.module, filters.track)
    && matchesTokens(entry.haystack, tokens));
}

/** Groups already-ordered entries by module, preserving order. */
export function groupPromptsByModule(entries: readonly PromptEntry[]): PromptModuleGroup[] {
  const groups: PromptModuleGroup[] = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.module.id === entry.module.id) last.entries.push(entry);
    else groups.push({ module: entry.module, entries: [entry] });
  }
  return groups;
}
