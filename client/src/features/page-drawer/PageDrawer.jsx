export function PageDrawer({ open, analysis, fileName, onClose }) {
  if (!open || !analysis) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/25">
      <aside className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-teal-700">PPT 原页侧拉面板</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">第 {analysis.pageNumber} 页原始内容</h2>
          </div>
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="mx-auto flex h-48 max-w-sm items-center justify-center rounded bg-white text-sm text-slate-500 shadow-inner">
            {fileName ? `材料来源：${fileName}` : '当前页面暂无上传材料来源'}
          </div>
        </div>

        <section className="mt-5 rounded-md border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-950">提取文字</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{analysis.pageText}</p>
        </section>

        <section className="mt-5 rounded-md border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-950">关联知识点</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(analysis.coreConcepts || []).map((concept) => (
              <span key={concept.name} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
                {concept.name}
              </span>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
