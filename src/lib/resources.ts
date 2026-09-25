import type { GlossaryTerm } from '@/data/glossary';
import type { AiTool, ToolCategory } from '@/data/aiTools';
import { buildHaystack, indexLetter, matchesTokens, rankMatch, searchTokens, slugify } from './textSearch.ts';

/**
 * Pure helpers for the static study resources: glossary (/membros/glossario) and
 * tools & costs (/membros/ferramentas). Data is passed in, so Node tests can use fixtures.
 */

export const GLOSSARY_PATH = '/membros/glossario';
export const TOOLS_PATH = '/membros/ferramentas';
export const GLOSSARY_ANCHOR_PREFIX = 'termo-';
export const TOOL_ANCHOR_PREFIX = 'ferramenta-';
/** Letters shown by the glossary index; "#" groups terms that start with a digit or symbol. */
export const INDEX_LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

/** Element id named by a URL fragment ("#termo-token" → "termo-token"); never throws on bad escapes. */
export function anchorIdFromHash(hash: string): string {
  const raw = hash.replace(/^#/, '');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function glossaryAnchorId(term: string): string {
  return `${GLOSSARY_ANCHOR_PREFIX}${slugify(term)}`;
}

export function letterAnchorId(letter: string): string {
  return letter === '#' ? 'letra-outros' : `letra-${letter.toLowerCase()}`;
}

export function toolAnchorId(toolId: string): string {
  return `${TOOL_ANCHOR_PREFIX}${slugify(toolId)}`;
}

function compareTerms(a: GlossaryTerm, b: GlossaryTerm): number {
  return a.term.localeCompare(b.term, 'pt-BR', { sensitivity: 'base' });
}

function glossaryHaystack(term: GlossaryTerm): string {
  return buildHaystack([term.term, term.english, term.definition, term.example, term.moduleCode, ...(term.related ?? [])]);
}

/** Finds a term by name ignoring case and accents ("janela de contexto" → "Janela de contexto"). */
export function findGlossaryTerm(terms: readonly GlossaryTerm[], name: string): GlossaryTerm | undefined {
  const slug = slugify(name);
  return terms.find((term) => slugify(term.term) === slug);
}

/** Accent-insensitive filter over term, English name, definition, example, module and related terms. */
export function filterGlossary(terms: readonly GlossaryTerm[], query: string): GlossaryTerm[] {
  const tokens = searchTokens(query);
  return terms.filter((term) => matchesTokens(glossaryHaystack(term), tokens)).sort(compareTerms);
}

export interface GlossaryLetterGroup {
  letter: string;
  terms: GlossaryTerm[];
}

/** Groups terms by index letter in INDEX_LETTERS order, sorted with pt-BR collation. */
export function groupGlossaryByLetter(terms: readonly GlossaryTerm[]): GlossaryLetterGroup[] {
  const groups = new Map<string, GlossaryTerm[]>();
  for (const term of [...terms].sort(compareTerms)) {
    const letter = indexLetter(term.term);
    groups.set(letter, [...(groups.get(letter) ?? []), term]);
  }
  return INDEX_LETTERS.filter((letter) => groups.has(letter)).map((letter) => ({ letter, terms: groups.get(letter)! }));
}

function rankGlossary(terms: readonly GlossaryTerm[], query: string): Array<{ term: GlossaryTerm; score: number }> {
  return terms
    .map((term) => ({ term, score: rankMatch(term.term, glossaryHaystack(term), query) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => (b.score - a.score) || compareTerms(a.term, b.term));
}

/** Ranked matches for the ⌘K search: name first, then anything else in the entry. */
export function searchGlossaryTerms(terms: readonly GlossaryTerm[], query: string, limit = 3): GlossaryTerm[] {
  return rankGlossary(terms, query).slice(0, limit).map((hit) => hit.term);
}

export interface ToolFilters {
  category: ToolCategory | null;
  moduleCode: string | null;
}

export function filterTools(tools: readonly AiTool[], filters: ToolFilters): AiTool[] {
  return tools.filter((tool) =>
    (filters.category === null || tool.category === filters.category)
    && (filters.moduleCode === null || tool.moduleCodes.includes(filters.moduleCode)));
}

/** Module codes used by the tools, in module order ("MOD-00", "MOD-01"…). */
export function toolModuleCodes(tools: readonly AiTool[]): string[] {
  return [...new Set(tools.flatMap((tool) => tool.moduleCodes))].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

export function countToolsByCategory(tools: readonly AiTool[]): Map<ToolCategory, number> {
  const counts = new Map<ToolCategory, number>();
  for (const tool of tools) counts.set(tool.category, (counts.get(tool.category) ?? 0) + 1);
  return counts;
}

function toolHaystack(tool: AiTool): string {
  return buildHaystack([tool.name, tool.company, tool.whatFor, tool.freeTier, tool.freeAlternative, ...tool.moduleCodes, ...tool.plans.map((plan) => plan.name)]);
}

function rankTools(tools: readonly AiTool[], query: string): Array<{ tool: AiTool; score: number }> {
  return tools
    .map((tool) => ({ tool, score: rankMatch(tool.name, toolHaystack(tool), query) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => (b.score - a.score) || a.tool.name.localeCompare(b.tool.name, 'pt-BR'));
}

export function searchTools(tools: readonly AiTool[], query: string, limit = 3): AiTool[] {
  return rankTools(tools, query).slice(0, limit).map((hit) => hit.tool);
}

export type ResourceHit =
  | { kind: 'glossary'; term: GlossaryTerm; score: number }
  | { kind: 'tool'; tool: AiTool; score: number };

/**
 * Glossary terms and tools for the ⌘K search, up to `limitPerKind` of each, merged by relevance
 * (an exact tool name beats a term that only mentions it). Ties keep glossary terms first.
 */
export function searchResources(terms: readonly GlossaryTerm[], tools: readonly AiTool[], query: string, limitPerKind = 3): ResourceHit[] {
  const glossaryHits = rankGlossary(terms, query).slice(0, limitPerKind).map(({ term, score }): ResourceHit => ({ kind: 'glossary', term, score }));
  const toolHits = rankTools(tools, query).slice(0, limitPerKind).map(({ tool, score }): ResourceHit => ({ kind: 'tool', tool, score }));
  return [...glossaryHits, ...toolHits].sort((a, b) => b.score - a.score);
}
