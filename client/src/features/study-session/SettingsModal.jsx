import { useEffect, useRef } from 'react';
import { AI_PROVIDERS } from '../../shared/storage/aiConfigStorage.js';

export function SettingsModal({
  open,
  onClose,
  subject,
  subjects,
  mode,
  modes,
  aiConfig,
  aiPreflight,
  isAiPreflightLoading,
  status,
  onSubjectChange,
  onModeChange,
  onAiConfigChange,
  onAiConfigSave,
  onAiPreflight,
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      dialogRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-md sm:items-center sm:py-8">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="设置"
        className="settings-modal-panel relative mx-4 my-8 w-full max-w-2xl rounded-3xl border border-white/[0.08] bg-[#181c24] shadow-2xl shadow-black/40 sm:my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-7 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">设置</h2>
            <p className="mt-1 text-xs text-slate-500">学科、学习模式与 AI 平台配置</p>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            type="button"
            onClick={onClose}
            aria-label="关闭设置"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-0 divide-y divide-white/[0.06]">
          {/* Section: 学习设置 */}
          <section className="px-7 py-6">
            <SectionLabel icon="📚" title="学习设置" />
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <Field label="学科">
                <select
                  className="field-select"
                  value={subject}
                  onChange={(e) => onSubjectChange(e.target.value)}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="学习模式">
                <select
                  className="field-select"
                  value={mode}
                  onChange={(e) => onModeChange(e.target.value)}
                >
                  {modes.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            {modes.find((m) => m.id === mode)?.hint && (
              <p className="mt-3 rounded-xl bg-white/[0.03] px-4 py-2.5 text-xs leading-5 text-slate-400">
                {modes.find((m) => m.id === mode).hint}
              </p>
            )}
          </section>

          {/* Section: AI 平台 */}
          <section className="px-7 py-6">
            <SectionLabel icon="⚡" title="AI 平台配置" />
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Provider">
                  <select
                    className="field-select"
                    value={aiConfig.provider}
                    onChange={(e) => onAiConfigChange('provider', e.target.value)}
                  >
                    {AI_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="模型">
                  <input
                    className="field-input"
                    value={aiConfig.model}
                    onChange={(e) => onAiConfigChange('model', e.target.value)}
                    placeholder="模型名"
                  />
                </Field>
              </div>
              <Field label="Chat Completions API URL">
                <input
                  className="field-input font-mono text-xs"
                  value={aiConfig.apiUrl}
                  onChange={(e) => onAiConfigChange('apiUrl', e.target.value)}
                  placeholder="https://api.openai.com/v1/chat/completions"
                />
              </Field>
              <Field label="API Key">
                <input
                  className="field-input font-mono text-xs"
                  value={aiConfig.apiKey}
                  onChange={(e) => onAiConfigChange('apiKey', e.target.value)}
                  placeholder="sk-..."
                  type="password"
                />
              </Field>
            </div>

            {/* Save + Preflight row */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#111418] transition hover:bg-slate-200 active:scale-[0.97]"
                type="button"
                onClick={() => { onAiConfigSave(); }}
              >
                保存配置
              </button>
              <button
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-teal-300/50 hover:bg-teal-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={onAiPreflight}
                disabled={isAiPreflightLoading}
              >
                {isAiPreflightLoading ? '自检中...' : 'AI 自检'}
              </button>
            </div>

            {/* Status feedback */}
            <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className={`inline-block h-2 w-2 rounded-full ${aiPreflight?.ready ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : aiConfig.apiKey ? 'bg-amber-400' : 'bg-slate-600'}`} />
                当前状态
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{status}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-white/[0.04] px-2.5 py-1">{aiConfig.providerLabel}</span>
                <span className="rounded-full bg-white/[0.04] px-2.5 py-1">{aiConfig.model}</span>
                <span className={`rounded-full px-2.5 py-1 ${aiConfig.apiKey ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/[0.04] text-slate-500'}`}>
                  {aiConfig.apiKey ? 'Key 已配置' : 'Key 未配置'}
                </span>
              </div>
              {aiPreflight && (
                <p className={`mt-3 text-xs font-medium ${aiPreflight.ready ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {aiPreflight.ready
                    ? '✓ 自检通过，AI 平台可正常使用'
                    : `✗ 自检未通过：${aiPreflight.fallbackReason || aiPreflight.providerStatus}`}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-7 py-4">
          <button
            className="w-full rounded-full bg-white/[0.06] py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.1] hover:text-white active:scale-[0.99]"
            type="button"
            onClick={onClose}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}
