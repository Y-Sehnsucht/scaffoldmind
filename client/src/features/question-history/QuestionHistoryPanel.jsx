export function QuestionHistoryPanel({
  items,
  records,
  profileSummary,
  questionTypeStats = [],
  activeRecordId,
  onSelectRecord,
  onCopyReviewPlan,
  onClearQuestions,
  onClearRecords,
}) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#1d2229] shadow-2xl shadow-black/20">
      <section className="min-h-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#1d2229]/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="text-base font-semibold text-white">📋 提问记录</h2>
            <p className="mt-1 text-xs text-slate-400">追问历史自动记录在这里</p>
          </div>
          <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10" type="button" onClick={onClearQuestions}>
            清空
          </button>
        </div>

        <div className="space-y-3 p-5">
          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm leading-6 text-slate-500">
              生成 AI 解析后，主动追问会自动进入这里。点击追问后，状态会从「待追问」变为「已回答」，完成诊断后会标记为「已强化」。
            </p>
          ) : (
            items.map((item, index) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-[#171b21] p-4">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Q{items.length - index} · 第 {item.pageNumber} 页</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-100">{item.question}</p>
                <p className="mt-1 text-xs text-slate-500">{item.concept}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="border-t border-white/10 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">📚 最近学习记录</h2>
            <p className="mt-1 text-xs text-slate-400">保存完整学习闭环，可随时恢复</p>
          </div>
          <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10" type="button" onClick={onClearRecords}>
            清空
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {records.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm leading-6 text-slate-500">
              保存学习记录后会显示最近记录。
            </p>
          ) : (
            records.slice(0, 5).map((record) => (
              <button
                key={record.id}
                className={`w-full rounded-2xl border p-4 text-left transition hover:border-teal-300/30 hover:bg-teal-300/10 ${
                  record.id === activeRecordId ? 'border-teal-300/40 bg-teal-300/10' : 'border-white/10 bg-[#171b21]'
                }`}
                type="button"
                onClick={() => onSelectRecord?.(record)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{record.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {record.subject} · {record.modeLabel}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-400">
                    恢复
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{record.input || '暂无材料摘要'}</p>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="border-t border-white/10 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">🎯 学习画像</h2>
            <p className="mt-1 text-xs text-slate-400">基于已保存记录生成薄弱点分析</p>
          </div>
          <button
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={!profileSummary || profileSummary.totalRecords === 0}
            onClick={onCopyReviewPlan}
          >
            复制计划
          </button>
        </div>

        {!profileSummary || profileSummary.totalRecords === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-white/10 p-4 text-sm leading-6 text-slate-500">
            保存几次学习记录后，这里会显示薄弱概念、高频错误和下一步复习建议。
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <ProfileBlock title="薄弱概念" items={profileSummary.weakConcepts} />
            <ProfileBlock title="高频错误" items={profileSummary.frequentErrorTypes} />
            <ProfileBlock title="常见问题类型" items={questionTypeStats} />
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm leading-6 text-emerald-50">
              {profileSummary.nextReviewSuggestion}
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}

function StatusBadge({ status = '' }) {
  const normalized = normalizeStatus(status);
  const styles = {
    pending: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
    answered: 'border-teal-300/30 bg-teal-300/10 text-teal-100',
    reinforced: 'border-violet-300/30 bg-violet-300/10 text-violet-100',
  };
  const labels = {
    pending: '待追问',
    answered: '已回答',
    reinforced: '已强化',
  };

  return (
    <span className={`rounded-full border px-2 py-1 font-medium ${styles[normalized]}`}>
      {labels[normalized]}
    </span>
  );
}

function normalizeStatus(status) {
  if (status.includes('强化')) {
    return 'reinforced';
  }
  if (status.includes('已回答') || status.includes('answered')) {
    return 'answered';
  }
  return 'pending';
}

function ProfileBlock({ title, items = [] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#171b21] p-4">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">暂无足够数据</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item.label} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">
              {item.label} · {item.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
