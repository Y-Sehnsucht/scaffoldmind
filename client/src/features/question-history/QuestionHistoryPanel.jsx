export function QuestionHistoryPanel({ items, records, onClearQuestions, onClearRecords }) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#1d2229] shadow-2xl shadow-black/20">
      <section className="min-h-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#1d2229]/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="text-base font-semibold text-white">提问记录</h2>
            <p className="mt-1 text-xs text-slate-400">快速回顾思考轨迹</p>
          </div>
          <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10" type="button" onClick={onClearQuestions}>
            清空
          </button>
        </div>

        <div className="space-y-3 p-5">
          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm leading-6 text-slate-500">
              点击主动追问后，问题会进入这里并保存到 localStorage。
            </p>
          ) : (
            items.map((item, index) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-[#171b21] p-4">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Q{items.length - index} · 第 {item.pageNumber} 页</span>
                  <span className="rounded-full bg-teal-300/15 px-2 py-1 font-medium text-teal-200">{item.status}</span>
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
            <h2 className="text-base font-semibold text-white">最近学习记录</h2>
            <p className="mt-1 text-xs text-slate-400">保存完整 Mock 闭环</p>
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
              <article key={record.id} className="rounded-2xl border border-white/10 bg-[#171b21] p-4">
                <p className="text-sm font-semibold text-slate-100">{record.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {record.subject} · {record.modeLabel}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}
