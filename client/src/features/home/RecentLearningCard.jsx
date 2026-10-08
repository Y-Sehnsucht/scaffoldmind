import { handleRouteClick, routeHref } from '../../routes/navigation.js';

const MODE_LABELS = {
  default: '默认解析',
  context_stacking: 'Context Stacking',
  feynman: '费曼反讲',
};

export function RecentLearningCard({ conversations }) {
  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--subtle)]">Recent</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">最近学习</h2>
        </div>
        <a className="text-sm text-teal-300 hover:text-teal-200" href={routeHref('/history')} onClick={(event) => handleRouteClick(event, '/history')}>查看全部</a>
      </div>
      <div className="mt-5 space-y-2">
        {conversations.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm leading-6 text-[var(--muted)]">开始一次对话后，这里会出现最近学习入口。</p>
        ) : (
          conversations.slice(0, 5).map((conversation) => (
            <a
              key={conversation.id}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 transition hover:border-teal-300/45"
              href={routeHref(`/chat?conversationId=${encodeURIComponent(conversation.id)}`)}
              onClick={(event) => handleRouteClick(event, `/chat?conversationId=${encodeURIComponent(conversation.id)}`)}
            >
              <p className="truncate text-sm font-semibold text-[var(--text)]">{conversation.title}</p>
              <p className="mt-1 text-xs text-[var(--subtle)]">{MODE_LABELS[conversation.mode] || conversation.mode} · {formatTime(conversation.updatedAt)}</p>
            </a>
          ))
        )}
      </div>
    </section>
  );
}

function formatTime(value) {
  if (!value) return '刚刚';
  try {
    return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  } catch {
    return '最近';
  }
}
