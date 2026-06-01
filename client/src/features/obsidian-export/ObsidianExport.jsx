export function ObsidianExport({ markdown, copied, fallbackVisible, onCopy }) {
  if (!markdown) {
    return null;
  }

  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Obsidian Markdown</h3>
          <p className="mt-1 text-sm text-slate-500">Mock 输出，包含 callout、wikilink 和 PPT 页码来源。</p>
        </div>
        <button
          className="rounded-md bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
          type="button"
          onClick={onCopy}
        >
          复制 Obsidian 笔记
        </button>
      </div>

      {copied ? <p className="mt-3 text-sm font-medium text-emerald-700">已复制到剪贴板。</p> : null}

      <pre className="mt-4 max-h-72 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        {markdown}
      </pre>

      {fallbackVisible ? (
        <label className="mt-4 block text-sm font-medium text-slate-700">
          浏览器复制 API 不可用，请手动复制：
          <textarea className="mt-2 min-h-40 w-full rounded-md border border-slate-300 p-3 text-sm" readOnly value={markdown} />
        </label>
      ) : null}
    </article>
  );
}
