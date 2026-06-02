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
        className={`min-w-0 max-w-[820px] rounded-[24px] border px-5 py-4 shadow-lg ${
          isUser
            ? 'border-teal-300/25 bg-[var(--user-bg)] text-[var(--text)]'
            : 'border-[var(--border)] bg-[var(--assistant-bg)] text-[var(--text)] shadow-black/10'
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-3 text-[0.8125rem] text-[var(--subtle)]">
          <span>{isUser ? '你' : 'ScaffoldMind 明序'}</span>
          {message.isStreaming && <span className="text-teal-300">生成中...</span>}
        </div>

        {message.attachments?.length > 0 && (
          <div className="mb-3">
            <AttachmentChips attachments={message.attachments} />
          </div>
        )}

        <div className="agent-markdown min-w-0 break-words text-base leading-[1.62] text-[var(--text)] [overflow-wrap:anywhere]">
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
  let list = [];

  function flushList() {
    if (!list.length) {
      return;
    }
    blocks.push(
      <ol key={`list-${blocks.length}`} className="my-3 space-y-1 pl-5">
        {list.map((item) => (
          <li key={item} className="list-decimal">
            {renderInline(item)}
          </li>
        ))}
      </ol>,
    );
    list = [];
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push(
        <h2 key={`h-${index}`} className="mb-3 mt-6 text-xl font-semibold text-[var(--text)] first:mt-0">
          {trimmed.slice(3)}
        </h2>,
      );
      return;
    }

    const listMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);

    if (listMatch) {
      list.push(listMatch[1]);
      return;
    }

    flushList();
    blocks.push(
      <p key={`p-${index}`} className="my-4 text-[var(--muted)]">
        {renderInline(trimmed)}
      </p>,
    );
  });

  flushList();
  return blocks.length ? blocks : <p className="text-slate-500">暂无内容</p>;
}

function renderInline(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-[var(--text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
