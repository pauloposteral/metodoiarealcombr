import { Fragment, useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Callout } from './ContentBlocks';
import { inlineText, parseMarkdown, type BlockNode, type InlineNode, type TableAlign } from '@/lib/markdown';
import { safeContentUrl } from '@/lib/safeUrl';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** Adds slug ids to headings (lesson pages); off by default so repeated snippets never duplicate ids. */
  headingIds?: boolean;
  /** `base` for long-form lesson text, `sm` for compact places such as chat answers. */
  size?: 'sm' | 'base';
}

/** React view of the Markdown AST built by `@/lib/markdown`. */
export function MarkdownRenderer({ content, className, headingIds = false, size = 'sm' }: MarkdownRendererProps) {
  const blocks = useMemo(() => parseMarkdown(content), [content]);
  return (
    <div
      className={cn(
        'markdown-content min-w-0 text-foreground/85 [overflow-wrap:anywhere]',
        size === 'base' ? 'text-[15px] leading-7 sm:text-base' : 'text-sm leading-relaxed',
        className,
      )}
    >
      <Blocks blocks={blocks} headingIds={headingIds} />
    </div>
  );
}

/** Vertical rhythm without `space-y`, so headings and callouts keep their own spacing. */
const FLOW = 'mt-4 first:mt-0';
const LINK_CLASS =
  'rounded-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

function Blocks({ blocks, headingIds }: { blocks: BlockNode[]; headingIds: boolean }) {
  return (
    <>
      {blocks.map((block, index) => (
        <Block key={index} block={block} headingIds={headingIds} />
      ))}
    </>
  );
}

function Block({ block, headingIds }: { block: BlockNode; headingIds: boolean }) {
  switch (block.type) {
    case 'heading': {
      const id = headingIds ? block.id : undefined;
      const content = <Inline nodes={block.children} />;
      if (block.level <= 2) {
        return <h2 id={id} className="mt-10 scroll-mt-24 font-display text-xl font-bold text-foreground first:mt-0 sm:text-2xl">{content}</h2>;
      }
      if (block.level === 3) {
        return <h3 id={id} className="mt-8 scroll-mt-24 font-display text-lg font-semibold text-foreground first:mt-0">{content}</h3>;
      }
      return <h4 id={id} className="mt-6 scroll-mt-24 font-semibold text-foreground first:mt-0">{content}</h4>;
    }
    case 'paragraph':
      return <p className={FLOW}><Inline nodes={block.children} /></p>;
    case 'bulletList':
      return (
        <ul role="list" className={cn(FLOW, 'space-y-2')}>
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3">
              <span className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span className="min-w-0"><Inline nodes={item} /></span>
            </li>
          ))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol role="list" className={cn(FLOW, 'space-y-3')}>
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3">
              <span className="mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 px-1.5 text-xs font-bold text-foreground">
                {item.number}
              </span>
              <span className="min-w-0 pt-px"><Inline nodes={item.children} /></span>
            </li>
          ))}
        </ol>
      );
    case 'code':
      return (
        <pre className={cn(FLOW, 'rounded-xl border border-border/50 bg-secondary p-4 text-sm leading-relaxed')}>
          <code className="whitespace-pre-wrap font-mono text-foreground/90 [overflow-wrap:anywhere]">{block.value}</code>
        </pre>
      );
    case 'blockquote':
      return (
        <blockquote className={cn(FLOW, 'rounded-r-lg border-l-4 border-accent/60 bg-secondary/50 px-4 py-3 text-foreground/80')}>
          <Blocks blocks={block.children} headingIds={headingIds} />
        </blockquote>
      );
    case 'table':
      return <Table block={block} />;
    case 'callout':
      return (
        <Callout kind={block.kind} title={block.title ? <Inline nodes={block.title} /> : undefined} className="mt-6 first:mt-0">
          <Blocks blocks={block.children} headingIds={headingIds} />
        </Callout>
      );
    case 'thematicBreak':
      return <hr className="my-8 border-border/60" />;
  }
}

const ALIGN_CLASS: Record<Exclude<TableAlign, null>, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };

function Table({ block }: { block: Extract<BlockNode, { type: 'table' }> }) {
  const label = `Tabela: ${block.header.map(inlineText).filter(Boolean).join(', ')}`;
  const align = (column: number) => ALIGN_CLASS[block.align[column] ?? 'left'];
  // Columns with long sentences get more room so rows stay short on phones.
  const width = block.header.map((header, column) => {
    const longest = Math.max(inlineText(header).length, ...block.rows.map((row) => inlineText(row[column] ?? []).length));
    return longest > 60 ? 'min-w-[15rem]' : 'min-w-[9rem]';
  });
  return (
    <div className="mt-6 first:mt-0">
      {block.header.length >= 3 && (
        <p className="mb-2 text-xs text-muted-foreground sm:hidden" aria-hidden="true">
          Deslize a tabela para o lado para ver todas as colunas.
        </p>
      )}
      {/* Inline-size containment keeps a wide table from widening the page; it scrolls inside the card. */}
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className="overflow-x-auto rounded-xl border border-border/60 [contain:inline-size] [overflow-wrap:normal] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <table className="w-full border-collapse text-sm">
          <thead className="bg-secondary/70">
            <tr>
              {block.header.map((cell, column) => (
                <th key={column} scope="col" className={cn('px-3 py-2.5 align-bottom font-semibold text-foreground', width[column], align(column))}>
                  <Inline nodes={cell} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="even:bg-secondary/25">
                {row.map((cell, column) => (
                  <td key={column} className={cn('px-3 py-2.5 align-top', width[column], align(column))}>
                    <Inline nodes={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Inline({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, index) => (
        <Fragment key={index}>{renderInline(node)}</Fragment>
      ))}
    </>
  );
}

function renderInline(node: InlineNode): ReactNode {
  switch (node.type) {
    case 'text':
      return node.value;
    case 'strong':
      return <strong className="font-semibold text-foreground"><Inline nodes={node.children} /></strong>;
    case 'emphasis':
      return <em><Inline nodes={node.children} /></em>;
    case 'code':
      return <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{node.value}</code>;
    case 'image': {
      const src = safeContentUrl(node.src, true);
      return src ? <img src={src} alt={node.alt} loading="lazy" className="my-2 inline-block h-auto max-w-full rounded-xl" /> : node.alt;
    }
    case 'link':
      return <MarkdownLink node={node} />;
  }
}

function MarkdownLink({ node }: { node: Extract<InlineNode, { type: 'link' }> }) {
  const children = <Inline nodes={node.children} />;
  // Defence in depth: the parser already sanitised the href.
  const href = safeContentUrl(node.href);
  if (!href) return children;
  if (node.target === 'internal') {
    return <Link to={href} className={LINK_CLASS}>{children}</Link>;
  }
  if (node.target === 'mailto') {
    return <a href={href} className={LINK_CLASS}>{children}</a>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {children}
      {/* The no-break space keeps the icon on the same line as the last word. */}
      {'\u00A0'}
      <ExternalLink className="inline h-3.5 w-3.5 align-[-0.125em]" aria-hidden="true" />
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

export default MarkdownRenderer;
