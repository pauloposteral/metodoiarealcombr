/**
 * Date-only values (AAAA-MM-DD) come from static data and `date` columns. Parsing them with
 * `new Date(value)` treats them as UTC midnight, which shows the previous day in Brazil, so
 * they are always formatted in UTC here.
 */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

const FORMATS = {
  long: new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
  short: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }),
} as const;

export type DateOnlyStyle = keyof typeof FORMATS;

export function parseDateOnly(value: string | null | undefined): Date | null {
  const match = value ? DATE_ONLY.exec(value) : null;
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  // Rejects impossible dates such as 2026-02-31, which Date.UTC silently rolls over.
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

/** "2026-09-24" → "24 de setembro de 2026" (long) or "24/09/2026" (short); null when invalid. */
export function formatDateOnly(value: string | null | undefined, style: DateOnlyStyle = 'long'): string | null {
  const date = parseDateOnly(value);
  return date ? FORMATS[style].format(date) : null;
}
