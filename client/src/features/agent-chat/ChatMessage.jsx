import { AttachmentChips } from './AttachmentChips.jsx';
import { InteractiveOptions } from './InteractiveOptions.jsx';
import { MessageActions } from './MessageActions.jsx';

export function ChatMessage({
  message,
  feedbackRating,
  interactiveOptions = [],
  isLatestAssistant,
  disabled,
  onCopyMessage,
  onFeedback,
  onOptionSelect,
}) {
  const isUser = message.role === 'user';

  return (
    <article className={`flex min-w-0 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`min-w-0 px-5 py-4 ${
          isUser
            ? 'max-w-[85%] rounded-[24px] border border-[var(--accent-green)]/25 bg-[var(--user-bg)] text-[var(--text-primary)] shadow-lg shadow-black/10'
            : 'w-full border-l-2 border-[var(--border-soft)] bg-transparent pl-6 text-[var(--text-primary)] shadow-none'
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-3 text-[0.8125rem] text-[var(--text-muted)]">
          <span>{isUser ? '你' : 'ScaffoldMind 明序'}</span>
          {message.isStreaming && <span className="text-[var(--accent-green)]">生成中...</span>}
        </div>

        {message.attachments?.length > 0 && (
          <div className="mb-3">
            <AttachmentChips attachments={message.attachments} />
          </div>
        )}

        <div className="agent-markdown min-w-0 break-words text-base leading-[1.62] text-[var(--text-primary)] [overflow-wrap:anywhere]">
          {renderMarkdownLike(message.content || (message.isStreaming ? '正在分析材料...' : ''))}
        </div>

        {!isUser && isLatestAssistant && (
          <InteractiveOptions options={interactiveOptions} disabled={disabled} onSelect={onOptionSelect} />
        )}

        {!isUser && message.content && !message.isStreaming && (
          <MessageActions message={message} rating={feedbackRating} onCopy={onCopyMessage} onFeedback={onFeedback} />
        )}
      </div>
    </article>
  );
}

function renderMarkdownLike(text) {
  const lines = String(text || '').split(/\r?\n/);
  const blocks = [];
  let list = null;
  let codeBlock = null;

  function flushList() {
    if (!list) return;
    const Tag = list.type === 'ol' ? 'ol' : 'ul';
    const itemClass = list.type === 'ol' ? 'list-decimal' : 'list-disc';
    blocks.push(
      <Tag key={`list-${blocks.length}`} className="my-3 space-y-1 pl-5 text-[var(--text-secondary)]">
        {list.items.map((item, index) => (
          <li key={`${item}-${index}`} className={itemClass}>
            {renderInline(item)}
          </li>
        ))}
      </Tag>,
    );
    list = null;
  }

  function flushCodeBlock() {
    if (!codeBlock) return;
    blocks.push(
      <pre key={`code-${blocks.length}`} className="my-4 overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-strong)] p-4 text-sm leading-6 text-[var(--text-primary)]">
        <code>{codeBlock.lines.join('\n')}</code>
      </pre>,
    );
    codeBlock = null;
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const fenceMatch = trimmed.match(/^```(\w+)?/);

    if (fenceMatch) {
      if (codeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        codeBlock = { language: fenceMatch[1] || '', lines: [] };
      }
      return;
    }

    if (codeBlock) {
      codeBlock.lines.push(line);
      return;
    }

    if (!trimmed) {
      flushList();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      blocks.push(renderHeading(headingMatch[1].length, headingMatch[2], index));
      return;
    }

    const quoteMatch = trimmed.match(/^>\s?(.+)$/);
    if (quoteMatch) {
      flushList();
      blocks.push(
        <blockquote key={`quote-${index}`} className="my-4 border-l-4 border-[var(--accent)] bg-[var(--panel-soft)] px-4 py-3 text-[var(--text-secondary)]">
          {renderInline(quoteMatch[1])}
        </blockquote>,
      );
      return;
    }

    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (orderedMatch) {
      if (!list || list.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(orderedMatch[1]);
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      if (!list || list.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(unorderedMatch[1]);
      return;
    }

    flushList();
    blocks.push(
      <p key={`p-${index}`} className="my-4 text-[var(--text-secondary)]">
        {renderInline(trimmed)}
      </p>,
    );
  });

  flushList();
  flushCodeBlock();

  return blocks.length ? blocks : <p className="text-[var(--text-muted)]">暂无内容</p>;
}

function renderHeading(level, content, index) {
  const sizes = {
    1: 'text-2xl',
    2: 'text-xl',
    3: 'text-lg',
    4: 'text-base',
  };
  const Tag = `h${Math.min(level, 4)}`;
  return (
    <Tag key={`h-${index}`} className={`mb-3 mt-6 font-semibold text-[var(--text-primary)] first:mt-0 ${sizes[level] || sizes[4]}`}>
      {renderInline(content)}
    </Tag>
  );
}

function renderInline(text) {
  const parts = String(text).split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${part}-${index}`} className="rounded-md border border-[var(--border-soft)] bg-[var(--panel-strong)] px-1.5 py-0.5 text-[0.92em] text-[var(--text-primary)]">
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-[var(--text-primary)]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={`${part}-${index}`} className="italic text-[var(--text-primary)]">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
