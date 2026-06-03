export function FeedbackTrend({ positive, negative }) {
  const total = Math.max(1, positive + negative);
  const positiveWidth = Math.round((positive / total) * 100);
  const negativeWidth = Math.round((negative / total) * 100);

  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <p className="text-sm text-[var(--subtle)]">Feedback</p>
      <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">反馈趋势</h2>
      <div className="mt-5 space-y-4">
        <Bar label="点赞" value={positive} width={positiveWidth} className="bg-teal-300" />
        <Bar label="点踩" value={negative} width={negativeWidth} className="bg-rose-300" />
      </div>
      <p className="mt-5 text-sm leading-6 text-[var(--muted)]">反馈会影响回答风格偏好与薄弱点判断，但所有数据只保存在本地。</p>
    </section>
  );
}

function Bar({ label, value, width, className }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-semibold text-[var(--text)]">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[var(--panel-soft)]">
        <div className={`h-full rounded-full ${className}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
