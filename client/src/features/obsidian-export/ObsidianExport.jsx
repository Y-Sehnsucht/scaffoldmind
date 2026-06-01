export function ObsidianExport({ markdown, copied, fallbackVisible, onCopy }) {
  if (!markdown) {
    return null;
  }

  return (
    <article className="rounded-[22px] border border-white/10 bg-[#20262e] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Obsidian Markdown</h3>
          <p className="mt-1 text-sm text-slate-400">Mock 输出，包含 callout、wikilink 和 PPT 页码来源。</p>
        </div>
        <button
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111418] transition hover:bg-slate-200"
          type="button"
          onClick={onCopy}
        >
          复制 Obsidian 笔记
        </button>
      </div>

      {copied ? <p className="mt-3 text-sm font-medium text-teal-300">已复制到剪贴板。</p> : null}

      <pre className="mt-4 max-h-72 overflow-auto rounded-2xl border border-white/10 bg-[#111418] p-4 text-xs leading-6 text-slate-200">
        {markdown}
      </pre>

      {fallbackVisible ? (
        <label className="mt-4 block text-sm font-medium text-slate-300">
          浏览器复制 API 不可用，请手动复制：
          <textarea
            className="mt-2 min-h-40 w-full rounded-2xl border border-white/10 bg-[#111418] p-3 text-sm text-slate-100"
            readOnly
            value={markdown}
          />
        </label>
      ) : null}
    </article>
  );
}
