type DraftStorage = Pick<Storage, 'length' | 'key' | 'removeItem'>;
const FAMILIES = ['ia-real:note-draft-v1:', 'ia-real:reel-v1:'] as const;

/** Remove this app's pending tab-local work on logout/account switch, never unrelated storage. */
export function clearAccountDrafts(storage: DraftStorage, userId?: string): void {
  try {
    const prefixes = FAMILIES.map(prefix => userId ? `${prefix}${userId}:` : prefix);
    const keys: string[] = [];
    for (let index = 0; index < storage.length; index++) { const key = storage.key(index); if (key && prefixes.some(prefix => key.startsWith(prefix))) keys.push(key); }
    for (const key of keys) storage.removeItem(key);
  } catch { /* Disabled storage must never prevent logout. */ }
}
