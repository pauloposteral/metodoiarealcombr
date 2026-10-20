import { inlineText, parseMarkdown, type BlockNode } from './markdown.ts';
import { videoEmbedUrl } from './httpsUrl.ts';

export type StudyKey = 'understand' | 'see' | 'practice' | 'review';
export type StudyTarget = { kind: 'heading'; id: string } | { kind: 'content' | 'code' | 'table' | 'video' | 'exercise' | 'project' | 'prompts' | 'review' };
export interface StudyStep { key: StudyKey; label: string; detail: string; target: StudyTarget }
export interface StudyOptions { videoUrl?: string | null; isProject?: boolean; promptsCount?: number }

const plain = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const isHeading = (block: BlockNode): block is Extract<BlockNode, { type: 'heading' }> => block.type === 'heading';
const hasExercise = (blocks: BlockNode[]): boolean => blocks.some(block =>
  (block.type === 'callout' && block.kind === 'exercise') ||
  ((block.type === 'callout' || block.type === 'blockquote') && hasExercise(block.children)));

/** Navigation metadata only. It never rewrites lesson text, saves progress, or invents media. */
export function buildStudyOutline(content: string | null | undefined, options: StudyOptions = {}): StudyStep[] {
  const source = content?.trim() ?? '';
  const video = Boolean(videoEmbedUrl(options.videoUrl));
  const prompts = (options.promptsCount ?? 0) > 0;
  if (!source && !video && !options.isProject && !prompts) return [];
  const blocks = parseMarkdown(source);
  const headings = blocks.filter(isHeading);
  const example = headings.find(block => /\b(exemplos?|caso|demonstracao|comparacao)\b|antes e depois|na pratica/.test(plain(inlineText(block.children))));
  const summary = [...headings].reverse().find(block => /^(resumo|recapitulacao|o que voce aprendeu)\b/.test(plain(inlineText(block.children))));
  const result: StudyStep[] = [];
  if (source) result.push({ key: 'understand', label: 'Entender', detail: 'Leia a ideia', target: { kind: 'content' } });
  const demonstration: StudyTarget | null = video ? { kind: 'video' } : example ? { kind: 'heading', id: example.id } :
    blocks.some(block => block.type === 'code') ? { kind: 'code' } : blocks.some(block => block.type === 'table') ? { kind: 'table' } : null;
  if (demonstration) result.push({ key: 'see', label: 'Ver', detail: video ? 'Veja a demonstração' : 'Observe o exemplo', target: demonstration });
  const practice: StudyTarget | null = options.isProject ? { kind: 'project' } : hasExercise(blocks) ? { kind: 'exercise' } : prompts ? { kind: 'prompts' } : null;
  if (practice) result.push({ key: 'practice', label: 'Fazer', detail: options.isProject ? 'Entregue seu projeto' : 'Pratique no seu contexto', target: practice });
  result.push({ key: 'review', label: 'Revisar', detail: 'Confira o que aprendeu', target: summary ? { kind: 'heading', id: summary.id } : { kind: 'review' } });
  return result;
}
