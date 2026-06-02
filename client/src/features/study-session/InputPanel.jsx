import { PreferenceChips } from './PreferenceChips.jsx';

export function InputPanel({
  currentMode,
  pageNumber,
  selectedPreferences,
  preferences,
  sourceFile,
  materialInfo,
  parsedPpt,
  sourceStatus,
  onPageNumberChange,
  onPreferenceToggle,
  onFileSelect,
  onUseParsedSlide,
  isFileLoading = false,
}) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#1d2229] shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-white">📂 来源</h2>
          <p className="mt-1 text-xs text-slate-400">第一步：上传或粘贴课程材料</p>
        </div>
        <span className="rounded-full bg-teal-400/15 px-2.5 py-1 text-[11px] font-semibold text-teal-300">步骤 1/3</span>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <section className="rounded-[22px] border border-dashed border-white/15 bg-[#171b21] p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-lg font-semibold text-[#111418]">
            +
          </div>
          <h3 className="mt-4 text-sm font-semibold text-white">添加材料</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            支持 TXT、Markdown、PDF 文本提取和 PPTX 轻量解析
          </p>
          <label className="mt-4 inline-flex cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111418] transition hover:bg-slate-200">
            选择文件
            <input
              className="hidden"
              type="file"
              accept=".txt,.md,.markdown,.pdf,.pptx,text/plain,text/markdown,application/pdf"
              disabled={isFileLoading}
              onChange={(event) => onFileSelect(event.target.files?.[0] || null)}
            />
          </label>

          {sourceFile ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-left">
              <p className="truncate text-sm font-medium text-slate-100">{sourceFile.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {formatFileSize(sourceFile.size)} · {sourceFile.type || '未知类型'}
              </p>
              {sourceStatus ? (
                <p className="mt-3 rounded-xl border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-xs leading-5 text-teal-100">
                  {sourceStatus}
                </p>
              ) : null}
            </div>
          ) : null}

          {isFileLoading ? (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-teal-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
              </span>
              正在提取材料...
            </div>
          ) : null}
        </section>

        {materialInfo ? (
          <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
            <h3 className="text-sm font-semibold text-emerald-200">✓ 材料已导入</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {materialInfo.fileName} · {sourceTypeLabel(materialInfo.sourceType)}
              {materialInfo.pageCount ? ` · ${materialInfo.pageCount} 页` : ''} · {materialInfo.extractedText?.length || 0} 字
            </p>
            <p className="mt-2 text-xs text-emerald-300/80">
              材料已自动填入中间输入框，点击「生成 AI 解析」即可开始
            </p>
            {materialInfo.warnings?.length ? (
              <p className="mt-2 text-xs leading-5 text-amber-200">{materialInfo.warnings.join('；')}</p>
            ) : null}
          </section>
        ) : null}

        {parsedPpt?.slides?.length ? (
          <section className="space-y-3 border-t border-white/10 pt-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">已解析 PPTX 页面</h3>
              <p className="mt-1 text-xs text-slate-500">共 {parsedPpt.slideCount} 页，点击任意页填入中间输入框</p>
            </div>
            <div className="space-y-3">
              {parsedPpt.slides.map((slide) => (
                <button
                  key={slide.pageNumber}
                  className={`group w-full overflow-hidden rounded-2xl border text-left transition ${
                    pageNumber === slide.pageNumber
                      ? 'border-teal-300/60 bg-teal-300/10'
                      : 'border-white/10 bg-[#171b21] hover:border-white/20 hover:bg-white/5'
                  }`}
                  type="button"
                  onClick={() => onUseParsedSlide(slide.pageNumber)}
                >
                  <div className="flex min-h-20 items-center gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-3">
                    <div className="grid h-14 w-16 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#111418] text-sm font-semibold text-slate-100">
                      {slide.pageNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">PPT 第 {slide.pageNumber} 页</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {slide.textBlocks.length} 个文本块 · {slide.images.length} 个图片占位
                      </p>
                    </div>
                  </div>
                  <p className="line-clamp-3 px-3 py-3 text-xs leading-5 text-slate-400">
                    {slide.textBlocks[0]?.text || '该页没有可直接读取的文本。若文字在图片中，需要 OCR 或视觉模型。'}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-3 border-t border-white/10 pt-5">
          <label className="block text-xs font-medium text-slate-400">
            PPT 页码（可选）
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
            <p className="mt-1 text-xs text-slate-500">选择偏好的学习方式，会影响 AI 解析侧重点</p>
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

function sourceTypeLabel(sourceType) {
  const labels = {
    txt: 'TXT',
    markdown: 'Markdown',
    pdf: 'PDF',
  };

  return labels[sourceType] || sourceType || '文本材料';
}
