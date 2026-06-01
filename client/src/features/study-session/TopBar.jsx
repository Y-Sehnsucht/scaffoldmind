export function TopBar({ subject, subjects, mode, modes, status, onSubjectChange, onModeChange }) {
  return (
    <header className="border-b border-slate-200 bg-white/95 px-5 py-4 shadow-sm">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">ScaffoldMind</p>
          <h1 className="text-2xl font-semibold text-slate-950">ScaffoldMind 明序</h1>
          <p className="mt-1 text-sm text-slate-600">输入材料 → 结构化解析 → 主动追问 → 尝试表达 → 诊断强化</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[180px_minmax(280px,520px)_160px] md:items-end">
          <label className="text-xs font-medium text-slate-600">
            学科
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              value={subject}
              onChange={(event) => onSubjectChange(event.target.value)}
            >
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-slate-600">
            学习模式
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              value={mode}
              onChange={(event) => onModeChange(event.target.value)}
            >
              {modes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            <span className="block text-xs font-medium text-emerald-700">当前状态</span>
            {status}
          </div>
        </div>
      </div>
    </header>
  );
}
