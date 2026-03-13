import React from 'react';
import { TipBox, WarningBox, SuccessBox, ExerciseBox } from './ContentBlocks';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight Markdown renderer that converts markdown text into styled React elements.
 * Supports: headings, bold, italic, code, blockquotes, lists, horizontal rules, links, images.
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const elements = parseMarkdown(content);

  return (
    <div className={`markdown-content space-y-4 ${className}`}>
      {elements}
    </div>
  );
}

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Custom blocks: :::tip, :::warning, :::success, :::exercise
    const blockMatch = line.trim().match(/^:::(tip|warning|success|exercise)(?:\s+(.+))?$/);
    if (blockMatch) {
      const blockType = blockMatch[1];
      const blockTitle = blockMatch[2];
      const blockLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') {
        blockLines.push(lines[i]);
        i++;
      }
      i++; // skip closing :::
      const blockContent = <span>{blockLines.map((bl, bi) => <React.Fragment key={bi}>{renderInline(bl)}{bi < blockLines.length - 1 && <br />}</React.Fragment>)}</span>;
      
      if (blockType === 'tip') elements.push(<TipBox key={key++}>{blockContent}</TipBox>);
      else if (blockType === 'warning') elements.push(<WarningBox key={key++}>{blockContent}</WarningBox>);
      else if (blockType === 'success') elements.push(<SuccessBox key={key++}>{blockContent}</SuccessBox>);
      else if (blockType === 'exercise') elements.push(<ExerciseBox key={key++} title={blockTitle}>{blockContent}</ExerciseBox>);
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      elements.push(renderHeading(level, text, key++));
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      elements.push(<hr key={key++} className="border-border/50 my-6" />);
      i++;
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={key++}
          className="border-l-4 border-accent/40 bg-accent/5 rounded-r-lg pl-4 pr-4 py-3 text-foreground/80 italic"
        >
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="text-sm leading-relaxed">
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={key++} className="space-y-2 ml-1">
          {listItems.map((item, li) => (
            <li key={li} className="flex items-start gap-2 text-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              <span className="text-sm leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={key++} className="space-y-2 ml-1">
          {listItems.map((item, li) => (
            <li key={li} className="flex items-start gap-3 text-foreground/80">
              <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {li + 1}
              </span>
              <span className="text-sm leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Code block
    if (line.trimStart().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre
          key={key++}
          className="bg-secondary rounded-xl p-4 overflow-x-auto border border-border/50"
        >
          <code className="text-sm font-mono text-foreground/90">
            {codeLines.join('\n')}
          </code>
        </pre>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-foreground/80 text-sm leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function renderHeading(level: number, text: string, key: number): React.ReactNode {
  const styles: Record<number, string> = {
    1: 'text-2xl font-bold text-foreground mt-8 mb-4 font-display',
    2: 'text-xl font-bold text-foreground mt-6 mb-3 font-display',
    3: 'text-lg font-semibold text-foreground mt-5 mb-2',
    4: 'text-base font-semibold text-foreground mt-4 mb-2',
    5: 'text-sm font-semibold text-foreground mt-3 mb-1',
    6: 'text-sm font-medium text-muted-foreground mt-3 mb-1',
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag key={key} className={styles[level] || styles[4]}>
      {renderInline(text)}
    </Tag>
  );
}

function renderInline(text: string): React.ReactNode {
  // Process inline elements: bold, italic, code, links, images
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partKey = 0;

  while (remaining.length > 0) {
    // Image: ![alt](url)
    const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      parts.push(
        <img
          key={partKey++}
          src={imgMatch[2]}
          alt={imgMatch[1]}
          className="rounded-xl max-w-full h-auto my-2"
          loading="lazy"
        />
      );
      remaining = remaining.slice(imgMatch[0].length);
      continue;
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={partKey++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent/80 underline underline-offset-2"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={partKey++}
          className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-accent"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={partKey++} className="font-semibold text-foreground">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(
        <em key={partKey++} className="italic">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Regular text - take until next special char
    const nextSpecial = remaining.search(/[`*\[!]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Special char that didn't match any pattern, treat as text
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export default MarkdownRenderer;
