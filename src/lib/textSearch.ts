/**
 * Accent- and case-insensitive text helpers shared by the members search surfaces
 * (prompt library, glossary, tools and the ⌘K search). Pure: safe to import from Node tests.
 */

const COMBINING_MARKS = /[̀-ͯ]/g;

/** Lowercases, strips accents and collapses whitespace: "  Ação   Rápida " → "acao rapida". */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Normalized, de-duplicated query tokens ("Janela  de CONTEXTO" → ["janela", "de", "contexto"]). */
export function searchTokens(query: string): string[] {
  const normalized = normalizeText(query);
  return normalized ? Array.from(new Set(normalized.split(' '))) : [];
}

/** Normalizes the searchable fields once, so filters can run on every keystroke cheaply. */
export function buildHaystack(fields: ReadonlyArray<string | null | undefined>): string {
  return normalizeText(fields.filter((field): field is string => Boolean(field)).join(' '));
}

/** True when every token appears in the haystack. No tokens means "no filter". */
export function matchesTokens(haystack: string, tokens: readonly string[]): boolean {
  return tokens.every((token) => haystack.includes(token));
}

export function matchesSearch(fields: ReadonlyArray<string | null | undefined>, query: string): boolean {
  return matchesTokens(buildHaystack(fields), searchTokens(query));
}

/**
 * Relevance of a match for short result lists: 3 = title starts with the query,
 * 2 = title contains it, 1 = every token is somewhere in the other fields, 0 = no match.
 */
export function rankMatch(title: string, haystack: string, query: string): number {
  const tokens = searchTokens(query);
  if (tokens.length === 0) return 0;
  const normalizedTitle = normalizeText(title);
  const normalizedQuery = tokens.join(' ');
  if (normalizedTitle.startsWith(normalizedQuery)) return 3;
  if (normalizedTitle.includes(normalizedQuery)) return 2;
  return matchesTokens(`${normalizedTitle} ${haystack}`, tokens) ? 1 : 0;
}

/** URL-fragment slug: "Prompt R.E.A.L." → "prompt-r-e-a-l". */
export function slugify(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Letter used by A–Z indexes: accents folded ("Ética" → "E"), anything else grouped under "#". */
export function indexLetter(value: string): string {
  const first = normalizeText(value).charAt(0).toUpperCase();
  return /^[A-Z]$/.test(first) ? first : '#';
}

/**
 * Turns free text into an `ilike` pattern that is safe inside PostgREST filters such as
 * `.or('title.ilike.<pattern>,...')`. Every character other than letters, digits, spaces and
 * hyphens (commas, parentheses, quotes, dots, `%`, `*`, backslashes…) becomes `_`, the
 * single-character wildcard: "R.E.A.L." still matches, but the filter string cannot be broken.
 * Returns null when nothing searchable is left.
 */
export function toIlikePattern(query: string, maxLength = 80): string | null {
  const cleaned = query
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
    .replace(/[^\p{L}\p{N} -]/gu, '_');
  return /[\p{L}\p{N}]/u.test(cleaned) ? `%${cleaned}%` : null;
}
