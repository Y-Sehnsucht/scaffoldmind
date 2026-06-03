export function ReviewSummary({ plan }) {
  const totalMinutes = (plan.reviewPlan || []).reduce((sum, item) => sum + Number(item.estimatedMinutes || 0), 0);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <SummaryCard label="待复习概念" value={`${plan.priorityConcepts?.length || 0} 个`} />
      <SummaryCard label="推荐步骤" value={`${plan.reviewPlan?.length || 0} 步`} />
      <SummaryCard label="预计用时" value={`${totalMinutes || 0} 分钟`} />
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{value}</p>
    </article>
  );
}
