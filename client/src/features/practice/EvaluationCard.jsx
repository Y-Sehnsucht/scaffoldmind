export function EvaluationCard({ evaluation }) {
  if (!evaluation) return null;

  return (
    <section className={`rounded-[32px] border p-6 ${evaluation.correct ? 'border-teal-300/30 bg-teal-400/10' : 'border-rose-300/30 bg-rose-400/10'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">AI 评价</p>
          <h3 className="mt-1 text-2xl font-semibold text-[var(--text)]">
            {evaluation.correct ? '这题答得不错' : '这题暴露了一个薄弱点'}
          </h3>
        </div>
        <span className="rounded-full bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)]">{evaluation.score} 分</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{evaluation.feedback}</p>
      {evaluation.mainIssue ? <p className="mt-3 text-sm text-[var(--text)]">主要问题：{evaluation.mainIssue}</p> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <PointList title="答对的关键点" items={evaluation.correctKeyPoints} />
        <PointList title="漏掉的关键点" items={evaluation.missedKeyPoints} />
      </div>
      {evaluation.nextAction === 'same_concept' ? (
        <p className="mt-5 rounded-2xl bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">建议：再来一道同知识点题目，把这个错误压下去。</p>
      ) : null}
    </section>
  );
}

function PointList({ title, items = [] }) {
  return (
    <div className="rounded-2xl bg-[var(--panel)] p-4">
      <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
        {(items.length ? items : ['暂无']).map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
