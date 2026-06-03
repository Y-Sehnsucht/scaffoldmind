export function MistakeList({ mistakes }) {
  return (
    <aside className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--text)]">错题薄弱点</h2>
        <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs text-[var(--muted)]">{mistakes.length} 条</span>
      </div>
      <div className="mt-4 space-y-3">
        {mistakes.length ? mistakes.slice(0, 6).map((item) => (
          <article key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-sm font-medium text-[var(--text)]">{item.knowledgePoint}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{item.mainIssue || item.question}</p>
            <p className="mt-2 text-xs text-[var(--subtle)]">{new Date(item.createdAt).toLocaleString('zh-CN')}</p>
          </article>
        )) : (
          <p className="rounded-2xl bg-[var(--panel-soft)] p-4 text-sm text-[var(--muted)]">还没有错题。提交答案后，答错的题会自动记录到这里。</p>
        )}
      </div>
    </aside>
  );
}
