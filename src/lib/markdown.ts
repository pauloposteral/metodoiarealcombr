/**
 * Markdown → block AST for lesson content (see the content format in the curriculum guide).
 *
 * Pure module: no React, no path aliases, so `node --test` can import it directly.
 * Supported: `##`/`###` headings with stable slug ids, one-line paragraphs, `- ` and `1. `
 * lists (ordered lists keep the source numbers), `>` quotes, fenced code, GFM tables,
 * `:::tip|warning|success|exercise Title` blocks whose inner content is full Markdown,
 * `---` rules and inline bold/italic/code/links/images. Every href goes through
 * `safeContentUrl`; unsafe links degrade to plain text.
 */
import { safeContentUrl } from './safeUrl.ts';

export type LinkTarget = 'internal' | 'external' | 'mailto';

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'emphasis'; children: InlineNode[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; target: LinkTarget; children: InlineNode[] }
  | { type: 'image'; src: string; alt: string };

export type CalloutKind = 'tip' | 'warning' | 'success' | 'exercise';
export type TableAlign = 'left' | 'center' | 'right' | null;
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface OrderedListItem {
  /** Number written in the source ("3." stays 3). */
  number: number;
  children: InlineNode[];
}

export type BlockNode =
  | { type: 'heading'; level: HeadingLevel; id: string; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'bulletList'; items: InlineNode[][] }
  | { type: 'orderedList'; items: OrderedListItem[] }
  | { type: 'code'; language: string | null; value: string }
  | { type: 'blockquote'; children: BlockNode[] }
  | { type: 'table'; align: TableAlign[]; header: InlineNode[][]; rows: InlineNode[][][] }
  | { type: 'callout'; kind: CalloutKind; title: InlineNode[] | null; children: BlockNode[] }
  | { type: 'thematicBreak' };

const CALLOUT_KINDS: readonly CalloutKind[] = ['tip', 'warning', 'success', 'exercise'];
const HEADING_LEVELS: readonly HeadingLevel[] = [1, 2, 3, 4, 5, 6];

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})[ \t]*([^`\s]*)[^`]*$/;
const CALLOUT_OPEN = /^:::(tip|warning|success|exercise)(?:[ \t]+(.*))?$/;
const HEADING = /^ {0,3}(#{1,6})[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/;
const THEMATIC_BREAK = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const BULLET_ITEM = /^[ \t]*[-*+][ \t]+(.*)$/;
const ORDERED_ITEM = /^[ \t]*(\d{1,9})[.)][ \t]+(.*)$/;
const QUOTE_LINE = /^ {0,3}>[ \t]?(.*)$/;
const TABLE_DELIMITER_CELL = /^:?-+:?$/;
const ESCAPABLE = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;

/** Lowercase ASCII slug used for heading anchors ("Por que é útil?" → "por-que-e-util"). */
export function slugify(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'secao';
}

type Slugger = (text: string) => string;

function createSlugger(): Slugger {
  const used = new Set<string>();
  return (text) => {
    const base = slugify(text);
    let candidate = base;
    for (let suffix = 2; used.has(candidate); suffix++) candidate = `${base}-${suffix}`;
    used.add(candidate);
    return candidate;
  };
}

/** Plain text of inline nodes (for slugs and accessible names). */
export function inlineText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
        case 'code':
          return node.value;
        case 'image':
          return node.alt;
        default:
          return inlineText(node.children);
      }
    })
    .join('');
}

export function parseMarkdown(source: string): BlockNode[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  return parseBlocks(lines, createSlugger());
}

function parseBlocks(lines: string[], slug: Slugger): BlockNode[] {
  const blocks: BlockNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '') {
      i++;
      continue;
    }

    const fence = FENCE_OPEN.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !isFenceClose(lines[i], fence[1])) body.push(lines[i++]);
      i++; // closing fence (or end of input when unclosed)
      blocks.push({ type: 'code', language: fence[2] ? fence[2].toLowerCase() : null, value: body.join('\n') });
      continue;
    }

    const callout = CALLOUT_OPEN.exec(trimmed);
    const kind = callout ? CALLOUT_KINDS.find((candidate) => candidate === callout[1]) : undefined;
    if (callout && kind) {
      const { inner, next } = collectCallout(lines, i + 1);
      const title = callout[2]?.trim();
      blocks.push({
        type: 'callout',
        kind,
        title: title ? parseInline(title) : null,
        children: parseBlocks(inner, slug),
      });
      i = next;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const children = parseInline(heading[2]);
      blocks.push({ type: 'heading', level: HEADING_LEVELS[heading[1].length - 1], id: slug(inlineText(children)), children });
      i++;
      continue;
    }

    if (THEMATIC_BREAK.test(line)) {
      blocks.push({ type: 'thematicBreak' });
      i++;
      continue;
    }

    if (QUOTE_LINE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length) {
        const quote = QUOTE_LINE.exec(lines[i]);
        if (!quote) break;
        inner.push(quote[1]);
        i++;
      }
      blocks.push({ type: 'blockquote', children: parseBlocks(inner, slug) });
      continue;
    }

    const table = parseTable(lines, i);
    if (table) {
      blocks.push(table.block);
      i = table.next;
      continue;
    }

    if (BULLET_ITEM.test(line)) {
      const items: string[] = [];
      i = collectListItems(lines, i, BULLET_ITEM, (match) => items.push(match[1]), (text) => {
        items[items.length - 1] += ` ${text}`;
      });
      blocks.push({ type: 'bulletList', items: items.map((item) => parseInline(item)) });
      continue;
    }

    if (ORDERED_ITEM.test(line)) {
      const items: { number: number; text: string }[] = [];
      i = collectListItems(lines, i, ORDERED_ITEM, (match) => items.push({ number: Number(match[1]), text: match[2] }), (text) => {
        items[items.length - 1].text += ` ${text}`;
      });
      blocks.push({ type: 'orderedList', items: items.map((item) => ({ number: item.number, children: parseInline(item.text) })) });
      continue;
    }

    // One line = one paragraph (content format rule).
    blocks.push({ type: 'paragraph', children: parseInline(trimmed) });
    i++;
  }
  return blocks;
}

function isFenceClose(line: string, open: string): boolean {
  const trimmed = line.trim();
  return trimmed.length >= open.length && Array.from(trimmed).every((char) => char === open[0]);
}

/** Lines up to the matching `:::`, honouring nested blocks and code fences. */
function collectCallout(lines: string[], start: number): { inner: string[]; next: number } {
  const inner: string[] = [];
  let depth = 0;
  let fence: string | null = null;
  let i = start;
  for (; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (fence) {
      if (isFenceClose(line, fence)) fence = null;
    } else if (FENCE_OPEN.test(line)) {
      fence = FENCE_OPEN.exec(line)?.[1] ?? null;
    } else if (CALLOUT_OPEN.test(trimmed)) {
      depth++;
    } else if (trimmed === ':::') {
      if (depth === 0) return { inner, next: i + 1 };
      depth--;
    }
    inner.push(line);
  }
  return { inner, next: i };
}

/**
 * Consecutive items of one list type. A blank line between items keeps the list open;
 * an indented plain line directly after an item continues that item.
 */
function collectListItems(
  lines: string[],
  start: number,
  pattern: RegExp,
  onItem: (match: RegExpExecArray) => void,
  onContinuation: (text: string) => void,
): number {
  let i = start;
  while (i < lines.length) {
    const match = pattern.exec(lines[i]);
    if (match) {
      onItem(match);
      i++;
      continue;
    }
    const line = lines[i];
    if (line.trim() === '') {
      let next = i + 1;
      while (next < lines.length && lines[next].trim() === '') next++;
      if (next < lines.length && pattern.test(lines[next])) {
        i = next;
        continue;
      }
      break;
    }
    if (/^[ \t]{2,}\S/.test(line) && !isBlockStart(line)) {
      onContinuation(line.trim());
      i++;
      continue;
    }
    break;
  }
  return i;
}

function isBlockStart(line: string): boolean {
  const trimmed = line.trim();
  return (
    FENCE_OPEN.test(line) ||
    CALLOUT_OPEN.test(trimmed) ||
    trimmed === ':::' ||
    HEADING.test(line) ||
    THEMATIC_BREAK.test(line) ||
    QUOTE_LINE.test(line) ||
    BULLET_ITEM.test(line) ||
    ORDERED_ITEM.test(line)
  );
}

/** Splits a GFM table row on unescaped pipes outside code spans. */
export function splitTableRow(line: string): string[] {
  let row = line.trim();
  if (row.startsWith('|')) row = row.slice(1);
  if (row.endsWith('|') && !row.endsWith('\\|')) row = row.slice(0, -1);
  const cells: string[] = [];
  let current = '';
  let inCode = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '\\' && row[i + 1] === '|') {
      current += '|';
      i++;
    } else if (char === '`') {
      inCode = !inCode;
      current += char;
    } else if (char === '|' && !inCode) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseTable(lines: string[], start: number): { block: BlockNode; next: number } | null {
  const headerLine = lines[start];
  const delimiterLine = lines[start + 1];
  if (delimiterLine === undefined || !headerLine.includes('|') || !delimiterLine.includes('|') || !delimiterLine.includes('-')) {
    return null;
  }
  const delimiter = splitTableRow(delimiterLine);
  if (!delimiter.every((cell) => TABLE_DELIMITER_CELL.test(cell))) return null;
  const header = splitTableRow(headerLine);
  if (header.length !== delimiter.length) return null;

  const align: TableAlign[] = delimiter.map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return null;
  });
  const rows: InlineNode[][][] = [];
  let i = start + 2;
  while (i < lines.length && lines[i].trim() !== '' && lines[i].includes('|') && !isFenceOrCallout(lines[i])) {
    const cells = splitTableRow(lines[i]);
    rows.push(header.map((_, column) => parseInline(cells[column] ?? '')));
    i++;
  }
  return { block: { type: 'table', align, header: header.map((cell) => parseInline(cell)), rows }, next: i };
}

function isFenceOrCallout(line: string): boolean {
  const trimmed = line.trim();
  return FENCE_OPEN.test(line) || CALLOUT_OPEN.test(trimmed) || trimmed === ':::';
}

// ---------------------------------------------------------------------------
// Inline
// ---------------------------------------------------------------------------

/** Resolves a Markdown destination to a safe href and how it should open. */
export function resolveLink(url: string): { href: string; target: LinkTarget } | null {
  const href = safeContentUrl(url);
  if (!href) return null;
  if (href.startsWith('/')) return { href, target: 'internal' };
  if (/^mailto:/i.test(href)) return { href, target: 'mailto' };
  return { href, target: 'external' };
}

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let buffer = '';
  const flush = () => {
    if (buffer) nodes.push({ type: 'text', value: buffer });
    buffer = '';
  };
  const push = (node: InlineNode) => {
    flush();
    nodes.push(node);
  };

  let i = 0;
  while (i < text.length) {
    const char = text[i];

    if (char === '\\' && i + 1 < text.length && ESCAPABLE.test(text[i + 1])) {
      buffer += text[i + 1];
      i += 2;
      continue;
    }

    if (char === '`') {
      const span = readCodeSpan(text, i);
      if (span) {
        push({ type: 'code', value: span.value });
        i = span.end;
        continue;
      }
      const run = /^`+/.exec(text.slice(i))?.[0] ?? '`';
      buffer += run;
      i += run.length;
      continue;
    }

    if (char === '!' && text[i + 1] === '[') {
      const link = readLink(text, i + 1);
      if (link) {
        const src = safeContentUrl(link.url, true);
        if (src) push({ type: 'image', src, alt: inlineText(parseInline(link.label)) });
        else buffer += link.label;
        i = link.end;
        continue;
      }
    }

    if (char === '[') {
      const link = readLink(text, i);
      if (link) {
        const children = parseInline(link.label);
        const resolved = resolveLink(link.url);
        if (resolved) push({ type: 'link', ...resolved, children });
        else {
          flush();
          nodes.push(...children);
        }
        i = link.end;
        continue;
      }
    }

    if ((char === '*' || char === '_') && text[i + 1] === char) {
      const end = findClosing(text, i + 2, char + char);
      if (end > i + 2 && canOpen(text, i, 2) && canClose(text, end)) {
        push({ type: 'strong', children: parseInline(text.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    if (char === '*' || char === '_') {
      const end = findClosing(text, i + 1, char);
      if (end > i + 1 && canOpen(text, i, 1) && canClose(text, end) && (char === '*' || isWordBoundary(text, i, end))) {
        push({ type: 'emphasis', children: parseInline(text.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    buffer += char;
    i++;
  }
  flush();
  return nodes;
}

function readCodeSpan(text: string, start: number): { value: string; end: number } | null {
  const run = /^`+/.exec(text.slice(start))?.[0];
  if (!run) return null;
  let search = start + run.length;
  while (search < text.length) {
    const close = text.indexOf(run, search);
    if (close === -1) return null;
    const after = close + run.length;
    if (text[after] !== '`' && text[close - 1] !== '`') {
      let value = text.slice(start + run.length, close);
      if (value.length > 2 && value.startsWith(' ') && value.endsWith(' ') && value.trim() !== '') value = value.slice(1, -1);
      return { value, end: after };
    }
    search = after;
  }
  return null;
}

/** `[label](url "title")` starting at `start` (the `[`). */
function readLink(text: string, start: number): { label: string; url: string; end: number } | null {
  let depth = 0;
  let i = start;
  for (; i < text.length; i++) {
    const char = text[i];
    if (char === '\\') {
      i++;
      continue;
    }
    if (char === '`') {
      const span = readCodeSpan(text, i);
      if (span) {
        i = span.end - 1;
        continue;
      }
    }
    if (char === '[') depth++;
    else if (char === ']' && --depth === 0) break;
  }
  if (i >= text.length || text[i + 1] !== '(') return null;
  const labelEnd = i;
  let j = i + 2;
  while (text[j] === ' ') j++;
  let url = '';
  if (text[j] === '<') {
    const close = text.indexOf('>', j);
    if (close === -1) return null;
    url = text.slice(j + 1, close);
    j = close + 1;
  } else {
    const urlStart = j;
    let parens = 0;
    for (; j < text.length; j++) {
      const char = text[j];
      if (char === '\\') {
        j++;
        continue;
      }
      if (char === ' ') break;
      if (char === '(') parens++;
      else if (char === ')') {
        if (parens === 0) break;
        parens--;
      }
    }
    url = text.slice(urlStart, j);
  }
  while (text[j] === ' ') j++;
  if (text[j] === '"' || text[j] === "'") {
    const close = text.indexOf(text[j], j + 1);
    if (close === -1) return null;
    j = close + 1;
    while (text[j] === ' ') j++;
  }
  if (text[j] !== ')') return null;
  return { label: text.slice(start + 1, labelEnd), url: url.trim(), end: j + 1 };
}

/** Index of the closing delimiter, skipping escapes and code spans; -1 when absent. */
function findClosing(text: string, from: number, delimiter: string): number {
  for (let i = from; i < text.length; i++) {
    const char = text[i];
    if (char === '\\') {
      i++;
      continue;
    }
    if (char === '`') {
      const span = readCodeSpan(text, i);
      if (span) {
        i = span.end - 1;
        continue;
      }
    }
    if (text.startsWith(delimiter, i)) {
      // `**` inside a single-char search belongs to strong emphasis: skip it.
      if (delimiter.length === 1 && text[i + 1] === delimiter) {
        const strongEnd = findClosing(text, i + 2, delimiter + delimiter);
        if (strongEnd === -1) return -1;
        i = strongEnd + 1;
        continue;
      }
      return i;
    }
  }
  return -1;
}

function canOpen(text: string, index: number, width: number): boolean {
  const next = text[index + width];
  return next !== undefined && !/\s/.test(next);
}

function canClose(text: string, index: number): boolean {
  const previous = text[index - 1];
  return previous !== undefined && !/\s/.test(previous);
}

/** `_` emphasis only at word boundaries, so snake_case_names stay intact. */
function isWordBoundary(text: string, open: number, close: number): boolean {
  const before = text[open - 1];
  const after = text[close + 1];
  const isWord = (char: string | undefined) => char !== undefined && /[\p{L}\p{N}]/u.test(char);
  return !isWord(before) && !isWord(after);
}
