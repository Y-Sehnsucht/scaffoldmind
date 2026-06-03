import { navigateTo } from '../../routes/navigation.js';

export function ReviewPlanList({ items }) {
  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">推荐复习顺序</h2>
        <span className="text-xs text-[var(--muted)]">按薄弱度和最近学习记录排序</span>
      </div>
      <div className="mt-5 space-y-4">
        {items.length ? items.map((item, index) => (
          <article key={item.id} className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-5 lg:flex-row lg:items-center">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal-400 text-sm font-bold text-slate-950">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-[var(--text)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.reason}</p>
              <p className="mt-2 text-xs text-[var(--subtle)]">预计 {item.estimatedMinutes || 15} 分钟</p>
            </div>
            <button
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              type="button"
              onClick={() => navigateTo(`/chat?concept=${encodeURIComponent(item.title)}`)}
            >
              去复习
            </button>
          </article>
        )) : (
          <p className="rounded-2xl bg-[var(--panel-soft)] p-4 text-sm text-[var(--muted)]">暂无复习计划。</p>
        )}
      </div>
    </section>
  );
}
