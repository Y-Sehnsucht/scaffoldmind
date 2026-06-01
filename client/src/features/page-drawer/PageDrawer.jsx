export function PageDrawer({ open, analysis, fileName, onClose }) {
  if (!open || !analysis) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
      <aside className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#1d2229] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-teal-300">PPT 原页侧拉面板</p>
            <h2 className="mt-1 text-xl font-semibold text-white">第 {analysis.pageNumber} 页原始内容</h2>
          </div>
          <button
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
            type="button"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="mt-5 rounded-[22px] border border-dashed border-white/10 bg-[#171b21] p-8 text-center">
          <div className="mx-auto flex h-48 max-w-sm items-center justify-center rounded-2xl bg-white/5 text-sm text-slate-400 shadow-inner">
            {fileName ? `图片占位：${fileName}` : 'PPT 截图占位（MVP 不做 OCR / 自动解析）'}
          </div>
        </div>

        <section className="mt-5 rounded-[22px] border border-white/10 bg-[#20262e] p-4">
          <h3 className="text-sm font-semibold text-white">提取文字占位</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{analysis.pageText}</p>
        </section>

        <section className="mt-5 rounded-[22px] border border-white/10 bg-[#20262e] p-4">
          <h3 className="text-sm font-semibold text-white">关联知识点</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(analysis.coreConcepts || []).map((concept) => (
              <span key={concept.name} className="rounded-full bg-teal-300/15 px-3 py-1 text-xs font-medium text-teal-200">
                {concept.name}
              </span>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
