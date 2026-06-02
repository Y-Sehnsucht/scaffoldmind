const modeInputLabels = {
  context_stacking: ['上周内容', '本周内容', '阅读材料或未完成作业'],
  after_class_review: ['PPT 页文字 / 课程材料'],
  examiner_perspective: ['题目', '我的初步思路', '相关知识点'],
  feynman: ['概念名称', '我的解释', '参考材料'],
  multi_source_collision: ['资料 A', '资料 B', '资料 C'],
};

export function MaterialComposer({
  currentMode,
  materialText,
  materialFields,
  onMaterialTextChange,
  onMaterialFieldChange,
  onGenerate,
  onSaveRecord,
  canSave,
  isLoading = false,
  isSaving = false,
  loadingMessage = '正在分析材料...',
  streamText = '',
}) {
  const labels = modeInputLabels[currentMode.id] || modeInputLabels.after_class_review;
  const hasMaterial = materialText?.trim() || Object.values(materialFields).some((v) => v?.trim());

  return (
    <section className="rounded-[22px] border border-white/10 bg-[#20262e] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">✏️ 输入学习材料</h3>
          <p className="mt-1 text-xs text-slate-400">
            第二步：粘贴或编辑材料，然后点击「生成 AI 解析」
          </p>
        </div>
        <span className="rounded-full bg-teal-400/15 px-2.5 py-1 text-[11px] font-semibold text-teal-300">步骤 2/3</span>
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-2xl border border-teal-300/20 bg-teal-300/[0.08] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-300" />
            </span>
            <span className="text-sm font-semibold text-teal-100">{loadingMessage}</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-teal-300/10">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-teal-300/60" />
          </div>
          <p className="mt-3 text-xs text-teal-200/60">
            AI 正在分析你的材料，通常需要 5-15 秒，请耐心等待...
          </p>
        </div>
      ) : null}

      {isLoading && streamText ? (
        <div className="mt-3 rounded-2xl border border-white/[0.06] bg-[#14181e] px-5 py-4">
          <p className="mb-2 text-xs font-semibold text-teal-300/80">AI 实时输出 ↓</p>
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-300">{streamText}</pre>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        {labels.map((label, index) => (
          <label key={label} className="block text-xs font-medium text-slate-400">
            {label}
            <textarea
              className="mt-1 min-h-24 w-full resize-y rounded-2xl border border-white/10 bg-[#14181e] px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20"
              placeholder={`输入${label}，用于学习闭环`}
              value={index === 0 ? materialText : materialFields[label] || ''}
              onChange={(event) => {
                if (index === 0) {
                  onMaterialTextChange(event.target.value);
                } else {
                  onMaterialFieldChange(label, event.target.value);
                }
              }}
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#111418] shadow-sm transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          disabled={isLoading}
          onClick={onGenerate}
        >
          {isLoading ? '⏳ 分析中...' : '🚀 生成 AI 解析'}
        </button>
        <button
          className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-teal-300/50 hover:bg-teal-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={!canSave || isSaving}
          onClick={onSaveRecord}
        >
          {isSaving ? '保存中...' : '💾 保存本次学习记录'}
        </button>
      </div>

      {!hasMaterial && !isLoading && (
        <p className="mt-3 text-xs text-amber-300/80">
          💡 提示：请先在输入框中粘贴课程材料，或从左侧上传文件
        </p>
      )}
    </section>
  );
}
