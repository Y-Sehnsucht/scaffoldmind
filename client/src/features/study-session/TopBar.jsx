import { MOCK_SOURCES } from './backendMockLearning.js';

export function TopBar({
  subject,
  subjects,
  mode,
  modes,
  status,
  mockSource,
  onSubjectChange,
  onModeChange,
  onMockSourceChange,
}) {
  return (
    <header className="border-b border-white/10 bg-[#171b21]/95 px-5 py-4 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-lg font-black text-[#111418] shadow-sm">
            S
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">ScaffoldMind</p>
            <h1 className="text-2xl font-semibold text-white">ScaffoldMind 明序</h1>
            <p className="mt-1 text-sm text-slate-400">
              输入材料 · 结构化解析 · 主动追问 · 尝试表达 · 诊断强化
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[150px_minmax(240px,420px)_300px_180px] md:items-end">
          <label className="text-xs font-medium text-slate-400">
            学科
            <select
              className="mt-1 w-full rounded-full border border-white/10 bg-[#22272f] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
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

          <label className="text-xs font-medium text-slate-400">
            学习模式
            <select
              className="mt-1 w-full rounded-full border border-white/10 bg-[#22272f] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
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

          <div className="text-xs font-medium text-slate-400">
            数据源
            <div className="mt-1 grid grid-cols-3 rounded-full border border-white/10 bg-[#22272f] p-1">
              <button
                className={sourceButtonClass(mockSource === MOCK_SOURCES.local)}
                type="button"
                onClick={() => onMockSourceChange(MOCK_SOURCES.local)}
              >
                本地 Mock
              </button>
              <button
                className={sourceButtonClass(mockSource === MOCK_SOURCES.backend)}
                type="button"
                onClick={() => onMockSourceChange(MOCK_SOURCES.backend)}
              >
                后端 Mock
              </button>
              <button
                className={sourceButtonClass(mockSource === MOCK_SOURCES.realApi)}
                type="button"
                onClick={() => onMockSourceChange(MOCK_SOURCES.realApi)}
              >
                真实 API
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-teal-400/20 bg-teal-400/10 px-3 py-2 text-sm text-teal-50">
            <span className="block text-xs font-medium text-teal-300">当前状态</span>
            {status}
          </div>
        </div>
      </div>
    </header>
  );
}

function sourceButtonClass(active) {
  return [
    'rounded-full px-3 py-1.5 text-sm font-semibold transition',
    active ? 'bg-white text-[#111418] shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white',
  ].join(' ');
}
