export function WeakConceptList({ concepts }) {
  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <p className="text-sm text-[var(--subtle)]">Weak Concepts</p>
      <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">薄弱概念</h2>
      <div className="mt-5 space-y-2">
        {concepts.length === 0 ? (
          <p className="text-sm leading-6 text-[var(--muted)]">暂无明显薄弱概念。点踩、反讲纠错或重复提问会逐步形成线索。</p>
        ) : (
          concepts.map((concept) => (
            <div key={concept.label} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3">
              <span className="min-w-0 truncate text-sm text-[var(--text)]">{concept.label}</span>
              <span className="rounded-full bg-rose-300/12 px-2.5 py-1 text-xs text-rose-100">{concept.count} 次</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
