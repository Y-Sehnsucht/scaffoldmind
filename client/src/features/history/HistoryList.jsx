import { RippleButton } from '../../components/ui/ripple-button.jsx';
import { handleRouteClick } from '../../routes/navigation.js';

const MODE_LABELS = {
  default: '默认解析',
  context_stacking: 'Context Stacking',
  feynman: '费曼反讲',
};

export function HistoryList({ conversations, selectedId, onSelect, onDelete }) {
  if (!conversations.length) {
    return (
      <div className="rounded-[30px] border border-dashed border-[var(--border)] bg-[var(--panel)] p-10 text-center text-[var(--muted)]">
        暂无匹配的学习记录。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <article
          key={conversation.id}
          className={`group rounded-[28px] border bg-[var(--panel)] p-5 shadow-sm transition ${
            selectedId === conversation.id ? 'border-teal-300/50 shadow-teal-950/10' : 'border-[var(--border)] hover:border-teal-300/35'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <RippleButton className="min-w-0 flex-1 text-left" type="button" onClick={() => onSelect(conversation.id)}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--panel-soft)] px-2.5 py-1 text-xs text-[var(--subtle)]">{MODE_LABELS[conversation.mode] || conversation.mode}</span>
                <span className="text-xs text-[var(--subtle)]">{formatTime(conversation.updatedAt)}</span>
              </div>
              <h2 className="mt-3 truncate text-lg font-semibold text-[var(--text)]">{conversation.title}</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{buildExcerpt(conversation)}</p>
              <p className="mt-3 text-xs text-[var(--subtle)]">{conversation.messages?.length || 0} 条消息</p>
            </RippleButton>
            <div className="flex shrink-0 gap-2">
              <RippleButton
                as="a"
                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text)] transition hover:border-teal-300/50"
                href={`/chat?conversationId=${encodeURIComponent(conversation.id)}`}
                onClick={(event) => handleRouteClick(event, `/chat?conversationId=${encodeURIComponent(conversation.id)}`)}
              >
                恢复
              </RippleButton>
              <RippleButton className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--subtle)] transition hover:border-rose-300/50 hover:text-rose-200" type="button" onClick={() => onDelete(conversation.id)}>
                删除
              </RippleButton>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function buildExcerpt(conversation) {
  const message = (conversation.messages || []).find((item) => item.role === 'assistant') || (conversation.messages || [])[0];
  return String(message?.content || '暂无摘要').replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').slice(0, 180);
}

function formatTime(value) {
  if (!value) return '刚刚';
  try {
    return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return '最近';
  }
}
