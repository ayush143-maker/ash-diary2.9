import { cn } from './cn';

/**
 * Safe, lightweight Markdown-lite renderer.
 * Returns React nodes directly (no dangerouslySetInnerHTML).
 * Supports: **bold**, *italic*, # Headings, - Lists, > Quotes, --- Dividers.
 */
export function MarkdownView({ content, className }: { content: string; className?: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1.5 text-ink">
          {listItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      flushList();
      continue;
    }

    if (trimmed === '---') {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="border-line my-6" />);
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="font-display text-2xl font-medium text-ink mt-2">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={`bq-${i}`} className="border-line border-l-2 pl-4 italic text-ink-2">
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2));
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-ink leading-relaxed">
        {parseInline(trimmed)}
      </p>
    );
  }
  
  flushList();

  return <div className={cn('space-y-4', className)}>{elements}</div>;
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={`b-${match.index}`} className="font-semibold">{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={`i-${match.index}`} className="italic">{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
