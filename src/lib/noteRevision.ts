export interface NoteVersion { id: string; content: string; updated_at: string }
export interface PendingNoteDraft { version: 1; content: string; baseUpdatedAt: string | null }
export function noteDraftKey(userId: string, lessonId: string): string { return `ia-real:note-draft-v1:${userId}:${lessonId}`; }
export function parseNoteDraft(value: string | null): PendingNoteDraft | null {
  if (!value || value.length > 1000000) return null;
  try { const d: unknown = JSON.parse(value); if (!d || typeof d !== 'object' || !('version' in d) || d.version !== 1 || !('content' in d) || typeof d.content !== 'string' || !('baseUpdatedAt' in d) || (d.baseUpdatedAt !== null && typeof d.baseUpdatedAt !== 'string')) return null; return { version: 1, content: d.content, baseUpdatedAt: typeof d.baseUpdatedAt === 'string' ? d.baseUpdatedAt : null }; } catch { return null; }
}
export function reconcileNoteDraft(server: NoteVersion | null, draft: PendingNoteDraft | null): { kind: 'server' | 'restore' | 'conflict'; content: string } {
  if (!draft || draft.content === (server?.content ?? '')) return { kind: 'server', content: server?.content ?? '' };
  return { kind: draft.baseUpdatedAt === (server?.updated_at ?? null) ? 'restore' : 'conflict', content: draft.content };
}
export function noteSaveResult(currentContent: string, submittedContent: string): { content: string; dirty: boolean } {
  return { content: currentContent, dirty: currentContent !== submittedContent };
}
