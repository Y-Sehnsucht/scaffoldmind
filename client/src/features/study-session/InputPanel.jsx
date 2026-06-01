import { PreferenceChips } from './PreferenceChips.jsx';

export function InputPanel({
  currentMode,
  pageNumber,
  selectedPreferences,
  preferences,
  sourceFile,
  parsedPpt,
  pptParseStatus,
  onPageNumberChange,
  onPreferenceToggle,
  onFileSelect,
  onParsePpt,
  onUseParsedSlide,
  isParsing = false,
}) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#1d2229] shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-white">来源</h2>
          <p className="mt-1 text-xs text-slate-400">添加课件、截图或手动材料，建立可回看的学习上下文。</p>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400">Source</span>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <section className="rounded-[22px] border border-dashed border-white/15 bg-[#171b21] p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-lg font-semibold text-[#111418]">
            +
          </div>
          <h3 className="mt-4 text-sm font-semibold text-white">添加文件</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            支持 PPTX 文本解析；PDF、图片 OCR 和旧版 PPT 先保留为来源占位，后续接专门解析服务。
          </p>
          <label className="mt-4 inline-flex cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111418] transition hover:bg-slate-200">
            选择文件
            <input
              className="hidden"
              type="file"
              accept=".ppt,.pptx,.pdf,image/*"
              onChange={(event) => onFileSelect(event.target.files?.[0] || null)}
            />
          </label>

          {sourceFile ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-left">
              <p className="truncate text-sm font-medium text-slate-100">{sourceFile.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {formatFileSize(sourceFile.size)} · {sourceFile.type || '未知类型'}
              </p>
              <button
                className="mt-3 w-full rounded-full border border-teal-300/30 px-3 py-2 text-xs font-semibold text-teal-100 transition hover:bg-teal-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={isParsing}
                onClick={onParsePpt}
              >
                {isParsing ? '解析中...' : '解析 PPTX 文本与结构'}
              </button>
            </div>
          ) : null}

          {pptParseStatus ? (
            <p className="mt-3 rounded-2xl border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-left text-xs leading-5 text-teal-100">
              {pptParseStatus}
            </p>
          ) : null}
        </section>

        {parsedPpt?.slides?.length ? (
          <section className="space-y-3 border-t border-white/10 pt-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">已解析页面</h3>
              <p className="mt-1 text-xs text-slate-500">共 {parsedPpt.slideCount} 页，可选择任意页填入中间输入框。</p>
            </div>
            <div className="space-y-2">
              {parsedPpt.slides.map((slide) => (
                <button
                  key={slide.pageNumber}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                    pageNumber === slide.pageNumber
                      ? 'border-teal-300/50 bg-teal-300/10'
                      : 'border-white/10 bg-[#171b21] hover:border-white/20 hover:bg-white/5'
                  }`}
                  type="button"
                  onClick={() => onUseParsedSlide(slide.pageNumber)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-100">第 {slide.pageNumber} 页</span>
                    <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">
                      {slide.textBlocks.length} 文本 · {slide.images.length} 图片
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                    {slide.textBlocks[0]?.text || '该页没有可直接读取的文本。'}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-3 border-t border-white/10 pt-5">
          <label className="block text-xs font-medium text-slate-400">
            PPT 页码
            <input
              className="mt-1 w-full rounded-2xl border border-white/10 bg-[#14181e] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20"
              min="1"
              type="number"
              value={pageNumber}
              onChange={(event) => onPageNumberChange(Number(event.target.value || 1))}
            />
          </label>
        </section>

        <section className="space-y-3 border-t border-white/10 pt-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">学习方法便签</h3>
            <p className="mt-1 text-xs text-slate-500">{currentMode.hint}</p>
          </div>
          <PreferenceChips
            preferences={preferences}
            selectedPreferences={selectedPreferences}
            onToggle={onPreferenceToggle}
          />
        </section>
      </div>
    </aside>
  );
}

function formatFileSize(size = 0) {
  if (!size) {
    return '0 KB';
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
