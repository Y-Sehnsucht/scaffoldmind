export function FeedbackRecordPanel({ conversation, feedbackEvents }) {
  const related = feedbackEvents.filter((event) => event.conversationId === conversation?.id);

  return (
    <aside className="sticky top-6 rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <p className="text-sm text-[var(--subtle)]">Feedback</p>
      <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">反馈记录</h2>
      {!conversation ? (
        <p className="mt-5 text-sm leading-6 text-[var(--muted)]">选择一条历史记录后，可以查看对应的点赞 / 点踩反馈。</p>
      ) : related.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm leading-6 text-[var(--muted)]">这条记录还没有反馈。</p>
      ) : (
        <div className="mt-5 space-y-3">
          {related.map((event) => (
            <div key={event.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
              <span className={`rounded-full px-2.5 py-1 text-xs ${event.rating === 'positive' ? 'bg-teal-300/15 text-teal-100' : 'bg-rose-300/15 text-rose-100'}`}>
                {event.rating === 'positive' ? '点赞' : '点踩'}
              </span>
              <p className="mt-3 line-clamp-5 text-sm leading-6 text-[var(--muted)]">{event.messageExcerpt || '无反馈片段'}</p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
