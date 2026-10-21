import { findResumeLesson, type CourseOutline, type OutlineLesson, type OutlineModule, type TrackKey } from './curriculum.ts';
interface ResumeEntry { course: { id: string; title: string }; outline: CourseOutline }
export interface CrossCourseResume { courseId: string; courseTitle: string; lesson: OutlineLesson; module: OutlineModule | null; fromRecent: boolean }

/** Use only catalog-authorized lessons. History is a hint, not an entitlement. */
export function findCrossCourseResume(entries: readonly ResumeEntry[], mainCourseId: string | null, recentIds: readonly string[], track: TrackKey | null, completed: ReadonlySet<string>): CrossCourseResume | null {
  const result = (entry: ResumeEntry, lesson: OutlineLesson, fromRecent: boolean): CrossCourseResume => ({ courseId: entry.course.id, courseTitle: entry.course.title, lesson, module: entry.outline.modules.find(module => module.id === lesson.module_id) ?? null, fromRecent });
  const pending = (lesson: OutlineLesson) => lesson.accessible && !completed.has(lesson.id);
  for (const id of recentIds) {
    const entry = entries.find(item => item.outline.lessons.some(lesson => lesson.id === id));
    if (!entry) continue;
    const index = entry.outline.lessons.findIndex(lesson => lesson.id === id);
    const recent = entry.outline.lessons[index];
    if (!recent.accessible) continue;
    if (pending(recent)) return result(entry, recent, true);
    const next = entry.outline.lessons.slice(index + 1).find(pending) ?? entry.outline.lessons.find(pending);
    if (next) return result(entry, next, true);
  }
  const ordered = [...entries.filter(entry => entry.course.id === mainCourseId), ...entries.filter(entry => entry.course.id !== mainCourseId)];
  for (const entry of ordered) {
    const next = findResumeLesson(entry.outline, entry.course.id === mainCourseId ? track : null, completed);
    if (next) return result(entry, next, false);
  }
  return null;
}
