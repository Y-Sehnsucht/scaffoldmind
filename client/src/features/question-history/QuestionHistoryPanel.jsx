export function QuestionHistoryPanel({ items, records, onClearQuestions, onClearRecords }) {
  return (
    <aside className="space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">提问记录</h2>
            <p className="mt-1 text-xs text-slate-500">快速回顾思考轨迹</p>
          </div>
          <button className="text-xs font-medium text-slate-500 hover:text-red-600" type="button" onClick={onClearQuestions}>
            清空
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {items.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm leading-6 text-slate-500">
              点击主动追问后，问题会进入这里并保存到 localStorage。
            </p>
          ) : (
            items.map((item, index) => (
              <article key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Q{items.length - index} · 第 {item.pageNumber} 页</span>
                  <span className="rounded bg-emerald-100 px-2 py-1 font-medium text-emerald-800">{item.status}</span>
                </div>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-950">{item.question}</p>
                <p className="mt-1 text-xs text-slate-500">{item.concept}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">最近学习记录</h2>
            <p className="mt-1 text-xs text-slate-500">保存完整 mock 闭环</p>
          </div>
          <button className="text-xs font-medium text-slate-500 hover:text-red-600" type="button" onClick={onClearRecords}>
            清空
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {records.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm leading-6 text-slate-500">
              保存学习记录后会显示最近记录。
            </p>
          ) : (
            records.slice(0, 5).map((record) => (
              <article key={record.id} className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-950">{record.title}</p>
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
