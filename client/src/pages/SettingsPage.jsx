import { useState } from 'react';
import { SettingsSection } from '../features/settings/SettingsSection.jsx';
import {
  applyTheme,
  clearLocalHistory,
  clearTaskCountdownPracticeData,
  exportLocalLearningData,
  loadThemeSetting,
} from '../shared/storage/settingsStorage.js';

export function SettingsPage() {
  const [theme, setTheme] = useState(() => loadThemeSetting());
  const [exportText, setExportText] = useState('');
  const [status, setStatus] = useState('AI 服务由后端环境变量配置，前端不提供密钥配置入口。');

  function handleThemeChange(nextTheme) {
    setTheme(applyTheme(nextTheme));
    setStatus(nextTheme === 'light' ? '已切换到日间主题。' : '已切换到夜间主题。');
  }

  function handleExport() {
    const snapshot = exportLocalLearningData();
    const text = JSON.stringify(snapshot, null, 2);
    setExportText(text);
    setStatus('本地学习数据 JSON 已生成。');
  }

  function handleClearHistory() {
    if (!window.confirm('确认清空本地历史、对话记忆和学习记录吗？此操作不可撤销。')) return;
    clearLocalHistory();
    setStatus('已清空本地历史。');
  }

  function handleClearTasksAndPractice() {
    if (!window.confirm('确认清空任务、倒数日和刷题记录吗？此操作不可撤销。')) return;
    clearTaskCountdownPracticeData();
    setStatus('已清空任务、倒数日和刷题记录。');
  }

  return (
    <main className="h-full overflow-y-auto bg-[var(--bg)] px-6 py-6 text-[var(--text)] lg:px-8">
      <div className="mx-auto flex w-full max-w-none flex-col gap-6">
        <section className="rounded-[36px] border border-[var(--border)] bg-[var(--panel-strong)] p-6">
          <p className="text-sm text-teal-300">Settings</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">只管理本地，不触碰密钥。</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            这里用于主题切换、导出本地学习数据、清理本地记录。AI 服务统一由 Express 后端环境变量配置。
          </p>
          <p className="mt-4 rounded-2xl bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--muted)]">{status}</p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <SettingsSection title="主题" description="切换日间 / 夜间主题，设置保存在本地 localStorage。">
              <div className="flex flex-wrap gap-3">
                <ThemeButton active={theme === 'dark'} label="夜间主题" onClick={() => handleThemeChange('dark')} />
                <ThemeButton active={theme === 'light'} label="日间主题" onClick={() => handleThemeChange('light')} />
              </div>
            </SettingsSection>

            <SettingsSection title="本地数据导出" description="导出 ScaffoldMind 明序的本地学习数据 JSON。可能包含密钥的本地配置项会被过滤。">
              <div className="flex flex-wrap gap-3">
                <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100" type="button" onClick={handleExport}>
                  生成导出 JSON
                </button>
                {exportText ? (
                  <a
                    className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-teal-300/60"
                    href={`data:application/json;charset=utf-8,${encodeURIComponent(exportText)}`}
                    download={`scaffoldmind-local-data-${new Date().toISOString().slice(0, 10)}.json`}
                  >
                    下载 JSON
                  </a>
                ) : null}
              </div>
              {exportText ? (
                <textarea className="field-input mt-4 min-h-56 font-mono text-xs" readOnly value={exportText} />
              ) : null}
            </SettingsSection>
          </div>

          <aside className="space-y-6">
            <SettingsSection title="AI 服务配置" description="真实 AI 服务只由后端环境变量管理。前端不会出现 API Key、Provider、Model 或 API URL 输入框。">
              <div className="rounded-2xl bg-teal-400/10 p-4 text-sm leading-6 text-teal-200">
                当前页面不会读取、展示或保存任何真实 API Key。需要切换 provider 或 model 时，请在后端配置完成后再重启服务。
              </div>
            </SettingsSection>

            <SettingsSection title="清理本地数据" description="这些操作只清理浏览器 localStorage，不会访问后端，也不会影响服务器环境变量。">
              <div className="space-y-3">
                <button className="w-full rounded-2xl border border-rose-300/30 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/15" type="button" onClick={handleClearHistory}>
                  清空本地历史
                </button>
                <button className="w-full rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15" type="button" onClick={handleClearTasksAndPractice}>
                  清空任务 / 倒数日 / 刷题记录
                </button>
              </div>
            </SettingsSection>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ThemeButton({ active, label, onClick }) {
  return (
    <button
      className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
        active ? 'bg-teal-400 text-slate-950' : 'border border-[var(--border)] text-[var(--text)] hover:border-teal-300/60'
      }`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
