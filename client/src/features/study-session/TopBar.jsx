export function TopBar({
  subject,
  subjects,
  mode,
  modes,
  status,
  aiConfig,
  aiPreflight,
  loadingAction,
  errorMessage,
  onOpenSettings,
}) {
  const subjectLabel = subjects.find((s) => s.id === subject)?.label || subject;
  const modeLabel = modes.find((m) => m.id === mode)?.label || mode;
  const statusDot = aiPreflight?.ready
    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
    : aiConfig.apiKey
      ? 'bg-amber-400'
      : 'bg-slate-600';

  const isLoading = Boolean(loadingAction);

  return (
    <header className="border-b border-white/[0.06] bg-[#14171e]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-5 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-black text-[#0a0e14] shadow-sm shadow-teal-500/20">
            明
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-400/80">ScaffoldMind</p>
            <h1 className="text-base font-semibold text-white leading-tight">明序</h1>
          </div>
        </div>

        {/* Status summary pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300">
            <span className="text-[10px]">📚</span>
            {subjectLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300">
            <span className="text-[10px]">🧠</span>
            {modeLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-400">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot}`} />
            {aiConfig.providerLabel} / {aiConfig.model}
          </span>
        </div>

        {/* Settings button */}
        <button
          className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-teal-400/30 hover:bg-teal-400/[0.06] hover:text-white active:scale-[0.97]"
          type="button"
          onClick={onOpenSettings}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400 transition group-hover:text-teal-300">
            <path d="M6.5 1.5a1.5 1.5 0 013 0v.35a5.48 5.48 0 011.77 1.02l.3-.17a1.5 1.5 0 011.5 2.6l-.3.17a5.5 5.5 0 010 2.06l.3.17a1.5 1.5 0 01-1.5 2.6l-.3-.17A5.48 5.48 0 019.5 11.15v.35a1.5 1.5 0 01-3 0v-.35a5.48 5.48 0 01-1.77-1.02l-.3.17a1.5 1.5 0 01-1.5-2.6l.3-.17a5.5 5.5 0 010-2.06l-.3-.17a1.5 1.5 0 011.5-2.6l.3.17A5.48 5.48 0 016.5 1.85V1.5z" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          设置
        </button>
      </div>

      {/* Global status bar — always visible */}
      <div className={`border-t px-5 py-2.5 text-sm transition-colors ${
        errorMessage
          ? 'border-rose-400/20 bg-rose-400/10 text-rose-100'
          : isLoading
            ? 'border-teal-400/20 bg-teal-400/[0.07] text-teal-100'
            : 'border-white/[0.03] bg-white/[0.01] text-slate-400'
      }`}>
        <div className="mx-auto flex max-w-[1800px] items-center gap-3">
          {isLoading && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-300" />
            </span>
          )}
          {errorMessage && (
            <span className="text-rose-300">⚠</span>
          )}
          <span className={errorMessage ? 'font-medium text-rose-100' : isLoading ? 'font-medium text-teal-100' : ''}>
            {errorMessage || status}
          </span>
          {!errorMessage && !isLoading && !aiConfig.apiKey && (
            <span className="ml-auto text-xs text-amber-300">
              请先点击「设置」配置 AI Key
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
