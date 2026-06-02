import { MOCK_SOURCES } from './backendMockLearning.js';

export function TopBar({
  subject,
  subjects,
  mode,
  modes,
  status,
  mockSource,
  aiStatus,
  onSubjectChange,
  onModeChange,
  onMockSourceChange,
}) {
  return (
    <header className="border-b border-slate-200 bg-white/95 px-5 py-4 shadow-sm">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">ScaffoldMind</p>
          <h1 className="text-2xl font-semibold text-slate-950">ScaffoldMind 明序</h1>
          <p className="mt-1 text-sm text-slate-600">
            输入材料 / 结构化解析 / 主动追问 / 尝试表达 / 诊断强化
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[150px_minmax(240px,420px)_270px_160px] md:items-end">
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

          <div className="text-xs font-medium text-slate-600">
            数据源
            <div className="mt-1 grid grid-cols-3 rounded-md border border-slate-300 bg-slate-100 p-1">
              <button
                className={sourceButtonClass(mockSource === MOCK_SOURCES.local)}
                type="button"
                onClick={() => onMockSourceChange(MOCK_SOURCES.local)}
              >
                本地演示
              </button>
              <button
                className={sourceButtonClass(mockSource === MOCK_SOURCES.backend)}
                type="button"
                onClick={() => onMockSourceChange(MOCK_SOURCES.backend)}
              >
                后端演示
              </button>
              <button
                className={sourceButtonClass(mockSource === MOCK_SOURCES.realApi)}
                type="button"
                onClick={() => onMockSourceChange(MOCK_SOURCES.realApi)}
              >
                真实 AI
              </button>
            </div>
          </div>

          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            <span className="block text-xs font-medium text-emerald-700">当前状态</span>
            {status}
            {aiStatus ? (
              <span className="mt-1 block text-xs text-emerald-700">
                {aiStatus.providerLabel} / {aiStatus.model} / {aiStatus.hasApiKey ? '已配置' : '未配置'}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function sourceButtonClass(active) {
  return [
    'rounded px-3 py-1.5 text-sm font-semibold transition',
    active ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:bg-white/70',
  ].join(' ');
}
